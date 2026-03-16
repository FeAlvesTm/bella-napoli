# Bella Napoli - Sistema de Delivery de Pizzaria
Projeto full-stack com integração real de pagamentos 

Backend (e frontend server-side) completo para pizzaria delivery real.  
**Demo em produção:** https://bella-napoli-ja3r.onrender.com

### Destaques
- API RESTful com Node.js + Express
- Pagamentos integrados via **Stripe** (Checkout + Webhooks)
- Autenticação segura com **JWT** + cookies httpOnly
- Banco PostgreSQL para produtos, pedidos, clientes e histórico
- Upload de imagens com **Cloudinary** + Multer
- Painel admin com dashboard e CRUD completo
- Carrinho com frete condicional e status de pedido em tempo real

### Tecnologias
- Backend: Node.js, Express, PostgreSQL, JWT, Stripe, bcryptjs, Cloudinary
- Frontend: Pug templates + CSS puro + JavaScript vanilla
- Deploy: Render.com

### Como rodar localmente
1. Clone o repo: `git clone https://github.com/seu-usuario/seu-repo.git`
2. `cd seu-repo`
3. `npm install`
4. Crie `.env` com:  
   - `DATABASE_URL=...` (PostgreSQL)  
   - `JWT_SECRET=...`  
   - `STRIPE_SECRET_KEY=...`  
   - `CLOUDINARY_URL=...`  
   etc.
5. `npm start`

**Pagamentos em modo teste Stripe**  
Use o cartão de teste:  
- Número: **4242 4242 4242 4242**  
- CVC: qualquer 3 dígitos (ex.: 123)  
- Data de vencimento: qualquer data futura (ex.: 12/34)  
- Nome: qualquer (ex.: Teste User)
