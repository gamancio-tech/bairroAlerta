// Variáveis de ambiente fictícias para os testes (o banco real nunca é acessado).
process.env.JWT_SECRET = 'chave-de-teste-com-mais-de-trinta-e-dois-caracteres';
process.env.DATABASE_URL = 'postgresql://teste:teste@localhost:5432/teste';
