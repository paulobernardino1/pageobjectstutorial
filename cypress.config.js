const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // URL base para os testes
    baseUrl: 'https://www.saucedemo.com',
    
    // Configurações de timeout
    defaultCommandTimeout: 10000,
