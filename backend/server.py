from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'chave-super-secreta-sistema-clientes-2025')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480

security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ===== MODELS =====

class Permissoes(BaseModel):
    consultar: bool = True
    cadastrar: bool = False
    editar: bool = False
    excluir: bool = False

class Usuario(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome: str
    usuario: str
    senha_hash: str
    tipo: str  # ADM, FISCAL, CONTABIL, RH
    permissoes: Permissoes
    ativo: bool = True
    criado_em: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UsuarioCreate(BaseModel):
    nome: str
    usuario: str
    senha: str
    tipo: str
    permissoes: Permissoes

class UsuarioLogin(BaseModel):
    usuario: str
    senha: str

class UsuarioResponse(BaseModel):
    id: str
    nome: str
    usuario: str
    tipo: str
    permissoes: Permissoes
    ativo: bool

class Token(BaseModel):
    access_token: str
    token_type: str
    usuario: UsuarioResponse

class Cliente(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    razao_social: str
    cnpj: str
    ccm: str
    regime_tributario: str
    natureza_juridica: str
    porte_empresa: str
    nome_responsavel: str
    telefones: List[str] = []
    emails: List[str] = []
    status: str  # PROBONO, ATIVO, INATIVO
    data_inicial: Optional[str] = None
    data_saida: Optional[str] = None
    criado_em: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    atualizado_em: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ClienteCreate(BaseModel):
    razao_social: str
    cnpj: str
    ccm: str
    regime_tributario: str
    natureza_juridica: str
    porte_empresa: str
    nome_responsavel: str
    telefones: List[str] = []
    emails: List[str] = []
    status: str = "ATIVO"
    data_inicial: Optional[str] = None
    data_saida: Optional[str] = None

class ClienteUpdate(BaseModel):
    razao_social: Optional[str] = None
    cnpj: Optional[str] = None
    ccm: Optional[str] = None
    regime_tributario: Optional[str] = None
    natureza_juridica: Optional[str] = None
    porte_empresa: Optional[str] = None
    nome_responsavel: Optional[str] = None
    telefones: Optional[List[str]] = None
    emails: Optional[List[str]] = None
    status: Optional[str] = None
    data_inicial: Optional[str] = None
    data_saida: Optional[str] = None

# ===== AUTH HELPERS =====

def hash_senha(senha: str) -> str:
    return bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verificar_senha(senha: str, senha_hash: str) -> bool:
    return bcrypt.checkpw(senha.encode('utf-8'), senha_hash.encode('utf-8'))

def criar_token(usuario_id: str, usuario_nome: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": usuario_id,
        "nome": usuario_nome,
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def get_usuario_atual(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario_id = payload.get("sub")
        if not usuario_id:
            raise HTTPException(status_code=401, detail="Token inválido")
        
        usuario = await db.usuarios.find_one({"id": usuario_id}, {"_id": 0})
        if not usuario:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        
        return Usuario(**usuario)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

def verificar_permissao(usuario: Usuario, acao: str):
    if usuario.tipo == "ADM":
        return True
    
    if acao == "consultar" and usuario.permissoes.consultar:
        return True
    elif acao == "cadastrar" and usuario.permissoes.cadastrar:
        return True
    elif acao == "editar" and usuario.permissoes.editar:
        return True
    elif acao == "excluir" and usuario.permissoes.excluir:
        return True
    
    return False

# ===== STARTUP - CRIAR USUARIO ADM =====

@app.on_event("startup")
async def criar_usuario_adm_padrao():
    usuario_adm = await db.usuarios.find_one({"tipo": "ADM"})
    if not usuario_adm:
        adm = Usuario(
            nome="Administrador",
            usuario="admin",
            senha_hash=hash_senha("admin123"),
            tipo="ADM",
            permissoes=Permissoes(consultar=True, cadastrar=True, editar=True, excluir=True)
        )
        await db.usuarios.insert_one(adm.model_dump())
        logger.info("Usuário ADM padrão criado: admin/admin123")

# ===== ROTAS DE AUTENTICAÇÃO =====

@api_router.post("/auth/login", response_model=Token)
async def login(dados: UsuarioLogin):
    usuario = await db.usuarios.find_one({"usuario": dados.usuario}, {"_id": 0})
    if not usuario or not verificar_senha(dados.senha, usuario["senha_hash"]):
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")
    
    if not usuario.get("ativo", True):
        raise HTTPException(status_code=401, detail="Usuário inativo")
    
    token = criar_token(usuario["id"], usuario["nome"])
    
    usuario_response = UsuarioResponse(
        id=usuario["id"],
        nome=usuario["nome"],
        usuario=usuario["usuario"],
        tipo=usuario["tipo"],
        permissoes=Permissoes(**usuario["permissoes"]),
        ativo=usuario.get("ativo", True)
    )
    
    return Token(access_token=token, token_type="bearer", usuario=usuario_response)

@api_router.get("/auth/me", response_model=UsuarioResponse)
async def get_me(usuario: Usuario = Depends(get_usuario_atual)):
    return UsuarioResponse(
        id=usuario.id,
        nome=usuario.nome,
        usuario=usuario.usuario,
        tipo=usuario.tipo,
        permissoes=usuario.permissoes,
        ativo=usuario.ativo
    )

# ===== ROTAS DE USUARIOS (APENAS ADM) =====

@api_router.post("/usuarios", response_model=UsuarioResponse)
async def criar_usuario(dados: UsuarioCreate, usuario: Usuario = Depends(get_usuario_atual)):
    if usuario.tipo != "ADM":
        raise HTTPException(status_code=403, detail="Apenas administradores podem criar usuários")
    
    # Verificar se usuário já existe
    existe = await db.usuarios.find_one({"usuario": dados.usuario})
    if existe:
        raise HTTPException(status_code=400, detail="Nome de usuário já existe")
    
    novo_usuario = Usuario(
        nome=dados.nome,
        usuario=dados.usuario,
        senha_hash=hash_senha(dados.senha),
        tipo=dados.tipo,
        permissoes=dados.permissoes
    )
    
    await db.usuarios.insert_one(novo_usuario.model_dump())
    
    return UsuarioResponse(
        id=novo_usuario.id,
        nome=novo_usuario.nome,
        usuario=novo_usuario.usuario,
        tipo=novo_usuario.tipo,
        permissoes=novo_usuario.permissoes,
        ativo=novo_usuario.ativo
    )

@api_router.get("/usuarios", response_model=List[UsuarioResponse])
async def listar_usuarios(usuario: Usuario = Depends(get_usuario_atual)):
    if usuario.tipo != "ADM":
        raise HTTPException(status_code=403, detail="Apenas administradores podem listar usuários")
    
    usuarios = await db.usuarios.find({}, {"_id": 0, "senha_hash": 0}).to_list(1000)
    return [UsuarioResponse(**u) for u in usuarios]

@api_router.put("/usuarios/{usuario_id}", response_model=UsuarioResponse)
async def atualizar_usuario(usuario_id: str, dados: UsuarioCreate, usuario: Usuario = Depends(get_usuario_atual)):
    if usuario.tipo != "ADM":
        raise HTTPException(status_code=403, detail="Apenas administradores podem atualizar usuários")
    
    usuario_existente = await db.usuarios.find_one({"id": usuario_id})
    if not usuario_existente:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    usuario_atualizado = Usuario(
        id=usuario_id,
        nome=dados.nome,
        usuario=dados.usuario,
        senha_hash=hash_senha(dados.senha) if dados.senha else usuario_existente["senha_hash"],
        tipo=dados.tipo,
        permissoes=dados.permissoes,
        ativo=usuario_existente.get("ativo", True),
        criado_em=usuario_existente["criado_em"]
    )
    
    await db.usuarios.update_one({"id": usuario_id}, {"$set": usuario_atualizado.model_dump()})
    
    return UsuarioResponse(
        id=usuario_atualizado.id,
        nome=usuario_atualizado.nome,
        usuario=usuario_atualizado.usuario,
        tipo=usuario_atualizado.tipo,
        permissoes=usuario_atualizado.permissoes,
        ativo=usuario_atualizado.ativo
    )

@api_router.delete("/usuarios/{usuario_id}")
async def deletar_usuario(usuario_id: str, usuario: Usuario = Depends(get_usuario_atual)):
    if usuario.tipo != "ADM":
        raise HTTPException(status_code=403, detail="Apenas administradores podem deletar usuários")
    
    if usuario_id == usuario.id:
        raise HTTPException(status_code=400, detail="Você não pode deletar seu próprio usuário")
    
    resultado = await db.usuarios.delete_one({"id": usuario_id})
    if resultado.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return {"mensagem": "Usuário deletado com sucesso"}

# ===== ROTAS DE CLIENTES =====

@api_router.post("/clientes", response_model=Cliente)
async def criar_cliente(dados: ClienteCreate, usuario: Usuario = Depends(get_usuario_atual)):
    if not verificar_permissao(usuario, "cadastrar"):
        raise HTTPException(status_code=403, detail="Você não tem permissão para cadastrar clientes")
    
    cliente = Cliente(**dados.model_dump())
    await db.clientes.insert_one(cliente.model_dump())
    return cliente

@api_router.get("/clientes", response_model=List[Cliente])
async def listar_clientes(usuario: Usuario = Depends(get_usuario_atual)):
    if not verificar_permissao(usuario, "consultar"):
        raise HTTPException(status_code=403, detail="Você não tem permissão para consultar clientes")
    
    clientes = await db.clientes.find(
        {"$or": [{"data_saida": None}, {"data_saida": ""}]},
        {"_id": 0}
    ).to_list(10000)
    return clientes

@api_router.get("/clientes/ex-clientes", response_model=List[Cliente])
async def listar_ex_clientes(usuario: Usuario = Depends(get_usuario_atual)):
    if not verificar_permissao(usuario, "consultar"):
        raise HTTPException(status_code=403, detail="Você não tem permissão para consultar clientes")
    
    ex_clientes = await db.clientes.find(
        {"data_saida": {"$exists": True, "$ne": None, "$ne": ""}},
        {"_id": 0}
    ).to_list(10000)
    return ex_clientes

@api_router.get("/clientes/{cliente_id}", response_model=Cliente)
async def obter_cliente(cliente_id: str, usuario: Usuario = Depends(get_usuario_atual)):
    if not verificar_permissao(usuario, "consultar"):
        raise HTTPException(status_code=403, detail="Você não tem permissão para consultar clientes")
    
    cliente = await db.clientes.find_one({"id": cliente_id}, {"_id": 0})
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    return Cliente(**cliente)

@api_router.put("/clientes/{cliente_id}", response_model=Cliente)
async def atualizar_cliente(cliente_id: str, dados: ClienteUpdate, usuario: Usuario = Depends(get_usuario_atual)):
    if not verificar_permissao(usuario, "editar"):
        raise HTTPException(status_code=403, detail="Você não tem permissão para editar clientes")
    
    cliente_existente = await db.clientes.find_one({"id": cliente_id})
    if not cliente_existente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    dados_atualizacao = {k: v for k, v in dados.model_dump().items() if v is not None}
    dados_atualizacao["atualizado_em"] = datetime.now(timezone.utc).isoformat()
    
    # Se data_saida foi informada, mover para ex-clientes e status INATIVO
    if dados_atualizacao.get("data_saida"):
        dados_atualizacao["status"] = "INATIVO"
    
    await db.clientes.update_one({"id": cliente_id}, {"$set": dados_atualizacao})
    
    cliente_atualizado = await db.clientes.find_one({"id": cliente_id}, {"_id": 0})
    return Cliente(**cliente_atualizado)

@api_router.delete("/clientes/{cliente_id}")
async def deletar_cliente(cliente_id: str, usuario: Usuario = Depends(get_usuario_atual)):
    if not verificar_permissao(usuario, "excluir"):
        raise HTTPException(status_code=403, detail="Você não tem permissão para excluir clientes")
    
    resultado = await db.clientes.delete_one({"id": cliente_id})
    if resultado.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    return {"mensagem": "Cliente deletado com sucesso"}

# ===== ROTAS DE OPÇÕES =====

@api_router.get("/opcoes/regimes-tributarios")
async def listar_regimes_tributarios():
    return [
        "Simples Nacional",
        "Lucro Presumido",
        "Lucro Real",
        "Imune"
    ]

@api_router.get("/opcoes/naturezas-juridicas")
async def listar_naturezas_juridicas():
    return [
        "MEI",
        "LTDA",
        "SA",
        "EIRELI",
        "DEMAIS"
    ]

@api_router.get("/opcoes/portes-empresa")
async def listar_portes_empresa():
    return [
        "MEI",
        "Microempresa",
        "Pequeno Porte",
        "Médio Porte",
        "Grande Porte"
    ]

@api_router.get("/opcoes/status")
async def listar_status():
    return [
        "PROBONO",
        "ATIVO",
        "INATIVO"
    ]

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()