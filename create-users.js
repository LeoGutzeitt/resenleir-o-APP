// Script para criar usuários no Supabase Auth
// Execute este script no console do navegador (F12) na página do app

// Primeiro, execute o setup-completo.sql no Supabase SQL Editor
// Depois, execute este script no console do navegador para criar os usuários

async function createUsers() {
  const users = [
    { email: 'admin@resenleirao.com', password: '123456', nome: 'Admin', role: 'admin', clube_id: null },
    { email: 'leo@resenleirao.com', password: '123456', nome: 'Leo', role: 'dono', clube_id: 1 },
    { email: 'felipe@resenleirao.com', password: '123456', nome: 'Felipe', role: 'dono', clube_id: 2 },
    { email: 'diego@resenleirao.com', password: '123456', nome: 'Diego', role: 'dono', clube_id: 3 },
    { email: 'pedro@resenleirao.com', password: '123456', nome: 'Pedro', role: 'dono', clube_id: 4 },
    { email: 'berenguer@resenleirao.com', password: '123456', nome: 'Berenguer', role: 'dono', clube_id: 5 },
    { email: 'bruno@resenleirao.com', password: '123456', nome: 'Bruno', role: 'dono', clube_id: 6 },
    { email: 'yves@resenleirao.com', password: '123456', nome: 'Yves', role: 'dono', clube_id: 7 },
    { email: 'adriano@resenleirao.com', password: '123456', nome: 'Adriano', role: 'dono', clube_id: 8 },
    { email: 'jhonny@resenleirao.com', password: '123456', nome: 'Jhonny', role: 'dono', clube_id: 9 },
    { email: 'piscina@resenleirao.com', password: '123456', nome: 'Piscina', role: 'dono', clube_id: 10 },
  ];

  for (const user of users) {
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password
    });
    
    if (error) {
      console.error(`Erro ao criar ${user.email}:`, error.message);
    } else {
      console.log(`Usuário ${user.email} criado com sucesso!`);
    }
  }
}

createUsers();