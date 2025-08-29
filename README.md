# 🎯 Tutorial: Page Objects com Cypress

> **Organize seus testes de forma profissional e elimine código duplicado**

## 📋 O que você vai aprender

- O que são Page Objects e por que usar
- Como estruturar testes Cypress de forma organizada
- Eliminar duplicação de código
- Criar comandos customizados reutilizáveis
- Manter testes fáceis de atualizar

## 🛠️ Pré-requisitos

- Node.js instalado
- Cypress básico
- Conhecimento de JavaScript/seletores CSS

## 🚨 O Problema

### ❌ Código Desorganizado (Como NÃO fazer)

```javascript
// Teste bagunçado e duplicado
describe('Login Tests', () => {
  it('Should login successfully', () => {
    cy.visit('https://www.saucedemo.com/')
    cy.get('#user-name').type('standard_user')
    cy.get('#password').type('secret_sauce')
    cy.get('#login-button').click()
    cy.url().should('include', '/inventory')
  })

  it('Should show error for invalid login', () => {
    cy.visit('https://www.saucedemo.com/')
    cy.get('#user-name').type('invalid_user')
    cy.get('#password').type('wrong_password')
    cy.get('#login-button').click()
    cy.get('[data-test="error"]').should('be.visible')
  })
})

describe('Shopping Tests', () => {
  it('Should add product to cart', () => {
    // Repetindo login em todo teste...
    cy.visit('https://www.saucedemo.com/')
    cy.get('#user-name').type('standard_user')
    cy.get('#password').type('secret_sauce')
    cy.get('#login-button').click()
    
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click()
    cy.get('.shopping_cart_badge').should('contain', '1')
  })
})
```

**Problemas:**
- Código duplicado em todo lugar
- Seletores espalhados pelos testes
- Difícil de manter quando UI muda
- Testes longos e confusos

## ✅ A Solução: Page Objects

### 📁 Estrutura do Projeto

```
cypress-page-objects/
├── cypress/
│   ├── e2e/
│   │   ├── login.cy.js
│   │   └── shopping.cy.js
│   ├── pages/
│   │   ├── LoginPage.js
│   │   ├── InventoryPage.js
│   │   └── CartPage.js
│   └── support/
│       ├── commands.js
│       └── e2e.js
├── cypress.config.js
└── package.json
```

## 🏗️ Implementação das Page Objects

### 1. LoginPage.js

```javascript
class LoginPage {
  // Seletores organizados
  get usernameField() {
    return cy.get('#user-name')
  }

  get passwordField() {
    return cy.get('#password')
  }

  get loginButton() {
    return cy.get('#login-button')
  }

  get errorMessage() {
    return cy.get('[data-test="error"]')
  }

  // Métodos de ação
  visit() {
    cy.visit('https://www.saucedemo.com/')
    return this
  }

  fillUsername(username) {
    this.usernameField.type(username)
    return this
  }

  fillPassword(password) {
    this.passwordField.type(password)
    return this
  }

  clickLogin() {
    this.loginButton.click()
    return this
  }

  // Método combinado
  login(username, password) {
    this.fillUsername(username)
    this.fillPassword(password)
    this.clickLogin()
    return this
  }

  // Validações
  shouldShowError() {
    this.errorMessage.should('be.visible')
    return this
  }

  shouldRedirectToInventory() {
    cy.url().should('include', '/inventory')
    return this
  }
}

export default LoginPage
```

### 2. InventoryPage.js

```javascript
class InventoryPage {
  get pageTitle() {
    return cy.get('.title')
  }

  get cartBadge() {
    return cy.get('.shopping_cart_badge')
  }

  get cartIcon() {
    return cy.get('.shopping_cart_link')
  }

  // Método dinâmico para produtos
  getAddToCartButton(productName) {
    return cy.get(`[data-test="add-to-cart-${productName}"]`)
  }

  getRemoveButton(productName) {
    return cy.get(`[data-test="remove-${productName}"]`)
  }

  getProductPrice(productName) {
    return cy.get(`[data-test="inventory-item-${productName}"] .inventory_item_price`)
  }

  // Ações
  addProductToCart(productName) {
    this.getAddToCartButton(productName).click()
    return this
  }

  removeProductFromCart(productName) {
    this.getRemoveButton(productName).click()
    return this
  }

  goToCart() {
    this.cartIcon.click()
    return this
  }

  // Validações
  shouldHaveTitle(title) {
    this.pageTitle.should('contain', title)
    return this
  }

  shouldShowCartBadge(count) {
    this.cartBadge.should('contain', count.toString())
    return this
  }

  shouldNotShowCartBadge() {
    this.cartBadge.should('not.exist')
    return this
  }
}

export default InventoryPage
```

### 3. CartPage.js

```javascript
class CartPage {
  get cartItems() {
    return cy.get('.cart_item')
  }

  get checkoutButton() {
    return cy.get('#checkout')
  }

  get continueShoppingButton() {
    return cy.get('#continue-shopping')
  }

  getCartItem(productName) {
    return cy.get('.cart_item').contains(productName).parent('.cart_item')
  }

  getRemoveButton(productName) {
    return this.getCartItem(productName).find('button[id*="remove"]')
  }

  // Ações
  removeItem(productName) {
    this.getRemoveButton(productName).click()
    return this
  }

  proceedToCheckout() {
    this.checkoutButton.click()
    return this
  }

  continueShopping() {
    this.continueShoppingButton.click()
    return this
  }

  // Validações
  shouldHaveItemCount(count) {
    this.cartItems.should('have.length', count)
    return this
  }

  shouldContainProduct(productName) {
    this.getCartItem(productName).should('exist')
    return this
  }

  shouldNotContainProduct(productName) {
    cy.get('.cart_item').contains(productName).should('not.exist')
    return this
  }
}

export default CartPage
```

## 🧪 Testes Organizados

### login.cy.js

```javascript
import LoginPage from '../pages/LoginPage'
import InventoryPage from '../pages/InventoryPage'

describe('Login Tests', () => {
  const loginPage = new LoginPage()
  const inventoryPage = new InventoryPage()

  beforeEach(() => {
    loginPage.visit()
  })

  it('Should login successfully with valid credentials', () => {
    loginPage
      .login('standard_user', 'secret_sauce')
      .shouldRedirectToInventory()

    inventoryPage
      .shouldHaveTitle('Products')
  })

  it('Should show error for invalid credentials', () => {
    loginPage
      .login('invalid_user', 'wrong_password')
      .shouldShowError()
  })

  it('Should show error for empty credentials', () => {
    loginPage
      .clickLogin()
      .shouldShowError()
  })
})
```

### shopping.cy.js

```javascript
import LoginPage from '../pages/LoginPage'
import InventoryPage from '../pages/InventoryPage'
import CartPage from '../pages/CartPage'

describe('Shopping Tests', () => {
  const loginPage = new LoginPage()
  const inventoryPage = new InventoryPage()
  const cartPage = new CartPage()

  beforeEach(() => {
    // Usando comando customizado
    cy.loginAsStandardUser()
  })

  it('Should add single product to cart', () => {
    inventoryPage
      .addProductToCart('sauce-labs-backpack')
      .shouldShowCartBadge(1)
  })

  it('Should add multiple products to cart', () => {
    inventoryPage
      .addProductToCart('sauce-labs-backpack')
      .addProductToCart('sauce-labs-bike-light')
      .shouldShowCartBadge(2)
  })

  it('Should remove product from inventory', () => {
    inventoryPage
      .addProductToCart('sauce-labs-backpack')
      .shouldShowCartBadge(1)
      .removeProductFromCart('sauce-labs-backpack')
      .shouldNotShowCartBadge()
  })

  it('Should view cart with added products', () => {
    inventoryPage
      .addProductToCart('sauce-labs-backpack')
      .goToCart()

    cartPage
      .shouldHaveItemCount(1)
      .shouldContainProduct('Sauce Labs Backpack')
  })

  it('Should remove product from cart', () => {
    inventoryPage
      .addProductToCart('sauce-labs-backpack')
      .goToCart()

    cartPage
      .shouldHaveItemCount(1)
      .removeItem('Sauce Labs Backpack')
      .shouldHaveItemCount(0)
  })
})
```

## 🛠️ Comandos Customizados

### cypress/support/commands.js

```javascript
import LoginPage from '../pages/LoginPage'

// Comando para login rápido
Cypress.Commands.add('loginAsStandardUser', () => {
  const loginPage = new LoginPage()
  
  loginPage
    .visit()
    .login('standard_user', 'secret_sauce')
    .shouldRedirectToInventory()
})

Cypress.Commands.add('loginAs', (username, password) => {
  const loginPage = new LoginPage()
  
  loginPage
    .visit()
    .login(username, password)
})

// Comando para adicionar produto via UI
Cypress.Commands.add('addProductToCart', (productName) => {
  cy.get(`[data-test="add-to-cart-${productName}"]`).click()
})

// Comando para limpar carrinho
Cypress.Commands.add('clearCart', () => {
  cy.get('.shopping_cart_link').click()
  
  cy.get('body').then($body => {
    if ($body.find('.cart_item').length > 0) {
      cy.get('.cart_item button[id*="remove"]').each($btn => {
        cy.wrap($btn).click()
      })
    }
  })
})
```

## 🎯 Vantagens dos Page Objects

### ✅ Antes vs Depois

| Antes | Depois |
|-------|--------|
| Seletores espalhados | Seletores centralizados |
| Código duplicado | Métodos reutilizáveis |
| Testes longos | Testes legíveis |
| Difícil manutenção | Fácil atualização |
| Acoplamento forte | Baixo acoplamento |

## 🚀 Boas Práticas

### 1. **Métodos fluentes (Method Chaining)**
```javascript
loginPage
  .visit()
  .fillUsername('user')
  .fillPassword('pass')
  .clickLogin()
  .shouldRedirectToInventory()
```

### 2. **Separação de responsabilidades**
```javascript
// ❌ Não faça
class LoginPage {
  loginAndAddProduct() {
    // Login + ações de outra página
  }
}

// ✅ Faça
class LoginPage {
  login() {
    // Apenas lógica de login
  }
}
```

### 3. **Métodos de validação separados**
```javascript
// Ações
addProductToCart(product) {
  this.getAddButton(product).click()
  return this
}

// Validações
shouldShowCartBadge(count) {
  this.cartBadge.should('contain', count)
  return this
}
```

### 4. **Use dados dinâmicos**
```javascript
const products = ['sauce-labs-backpack', 'sauce-labs-bike-light']

products.forEach(product => {
  it(`Should add ${product} to cart`, () => {
    inventoryPage.addProductToCart(product)
  })
})
```

## 📊 Estrutura de Arquivos Recomendada

```
cypress/
├── e2e/
│   ├── auth/
│   │   ├── login.cy.js
│   │   └── logout.cy.js
│   ├── shopping/
│   │   ├── add-to-cart.cy.js
│   │   └── checkout.cy.js
│   └── user/
│       └── profile.cy.js
├── pages/
│   ├── common/
│   │   └── BasePage.js
│   ├── auth/
│   │   └── LoginPage.js
│   └── shopping/
│       ├── InventoryPage.js
│       └── CartPage.js
├── support/
│   ├── commands.js
│   └── e2e.js
└── fixtures/
    └── users.json
```

## 🔄 Page Object Base (Opcional)

```javascript
// pages/common/BasePage.js
class BasePage {
  visit(url) {
    cy.visit(url)
    return this
  }

  waitForPageLoad() {
    cy.get('body').should('be.visible')
    return this
  }

  getElementByTestId(testId) {
    return cy.get(`[data-test="${testId}"]`)
  }
}

export default BasePage
```

## 🚦 Como executar os testes

```bash
# Instalar dependências
npm install --save-dev cypress

# Executar testes
npx cypress open

# Executar em modo headless
npx cypress run

# Executar testes específicos
npx cypress run --spec "cypress/e2e/login.cy.js"
```

## 📈 Comparação de Resultados

### Sem Page Objects:
- 50 linhas de código duplicado
- 15 minutos para alterar um seletor
- Testes difíceis de entender

### Com Page Objects:
- 0 duplicação de código
- 2 minutos para alterar seletor
- Testes auto-explicativos

## 🎓 Próximos Passos

- Implementar Page Objects em seus projetos existentes
- Criar comandos customizados para fluxos comuns
- Adicionar TypeScript para melhor intellisense
- Explorar padrões avançados (Factory, Builder)

## 📞 Dúvidas?

Deixe suas dúvidas nos comentários ou abra uma issue no GitHub!

---

**📌 Gostou do tutorial? Deixe uma ⭐ no repositório e compartilhe com outros QAs!**

---

*Tutorial criado por [Seu Nome] - Conecte-se no [LinkedIn](seu-linkedin)*
