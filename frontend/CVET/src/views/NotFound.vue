<template>
  <div class="not-found">
    <div class="container">
      <div class="error-content">
        <h1>404</h1>
        <h2>Страница не найдена</h2>
        <p>Запрашиваемая страница не существует или была перемещена.</p>
        <router-link to="/" class="btn btn-primary">Вернуться на главную</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--background);
  text-align: center;
}

.error-content {
  max-width: 500px;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 5rem;
  color: var(--primary);
  margin: 0;
  line-height: 1;
}

h2 {
  font-size: 1.75rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}

p {
  margin-bottom: 2rem;
  color: var(--text-secondary);
}

.btn-primary {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  background-color: var(--primary);
  color: white;
  text-decoration: none;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
}
</style> 