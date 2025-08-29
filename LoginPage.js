// cypress/pages/LoginPage.js
class LoginPage {
  // Elementos da página
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

  get errorButton() {
    return cy.get('.error-button')
  }

  // Ações da página
  visit() {
    cy.visit('https://www.saucedemo.com/')
    return this
  }

  fillUsername(username) {
    this.usernameField.clear().type(username)
    return this
  }

  fillPassword(password) {
    this.passwordField.clear().type(password)
    return this
  }

  clickLogin() {
    this.loginButton.click()
    return this
  }

  clearError() {
    this.errorButton.click()
    return this
  }

  // Método combinado para login completo
  login(username, password) {
    this.fillUsername(username)
    this.fillPassword(password)
    this.clickLogin()
    return this
  }

  // Validações
  shouldShowError(message) {
    this.errorMessage.should('be.visible')
    if (message) {
      this.errorMessage.should('contain', message)
    }
    return this
  }

  shouldRedirectToInventory() {
    cy.url().should('include', '/inventory')
    return this
  }

  shouldBeOnLoginPage() {
    cy.url().should('include', 'saucedemo.com')
    this.loginButton.should('be.visible')
    return this
  }
}

export default LoginPage

// =====================================================

// cypress/pages/InventoryPage.js
class InventoryPage {
  // Elementos da página
  get pageTitle() {
    return cy.get('.title')
  }

  get cartBadge() {
    return cy.get('.shopping_cart_badge')
  }

  get cartIcon() {
    return cy.get('.shopping_cart_link')
  }

  get menuButton() {
    return cy.get('#react-burger-menu-btn')
  }

  get logoutLink() {
    return cy.get('#logout_sidebar_link')
  }

  get inventoryItems() {
    return cy.get('.inventory_item')
  }

  get sortDropdown() {
    return cy.get('.product_sort_container')
  }

  // Métodos dinâmicos para produtos
  getAddToCartButton(productId) {
    return cy.get(`[data-test="add-to-cart-${productId}"]`)
  }

  getRemoveButton(productId) {
    return cy.get(`[data-test="remove-${productId}"]`)
  }

  getProductTitle(productId) {
    return cy.get(`#item_${productId}_title_link`)
  }

  getProductPrice(productId) {
    return cy.get(`.inventory_item:has([data-test="add-to-cart-${productId}"]) .inventory_item_price`)
  }

  getProductImage(productId) {
    return cy.get(`#item_${productId}_img_link img`)
  }

  // Ações da página
  addProductToCart(productId) {
    this.getAddToCartButton(productId).click()
    return this
  }

  removeProductFromCart(productId) {
    this.getRemoveButton(productId).click()
    return this
  }

  goToCart() {
    this.cartIcon.click()
    return this
  }

  openMenu() {
    this.menuButton.click()
    return this
  }

  logout() {
    this.openMenu()
    this.logoutLink.click()
    return this
  }

  sortProducts(option) {
    this.sortDropdown.select(option)
    return this
  }

  clickProductTitle(productId) {
    this.getProductTitle(productId).click()
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

  shouldHaveProductCount(count) {
    this.inventoryItems.should('have.length', count)
    return this
  }

  shouldShowProduct(productId) {
    this.getAddToCartButton(productId).should('exist')
    return this
  }
}

export default InventoryPage

// =====================================================

// cypress/pages/CartPage.js
class CartPage {
  // Elementos da página
  get pageTitle() {
    return cy.get('.title')
  }

  get cartItems() {
    return cy.get('.cart_item')
  }

  get checkoutButton() {
    return cy.get('#checkout')
  }

  get continueShoppingButton() {
    return cy.get('#continue-shopping')
  }

  get cartQuantity() {
    return cy.get('.cart_quantity')
  }

  // Métodos para itens específicos
  getCartItem(productName) {
    return cy.get('.cart_item').contains('.inventory_item_name', productName).parent('.cart_item')
  }

  getRemoveButton(productName) {
    return this.getCartItem(productName).find('button[id*="remove"]')
  }

  getItemQuantity(productName) {
    return this.getCartItem(productName).find('.cart_quantity')
  }

  getItemPrice(productName) {
    return this.getCartItem(productName).find('.inventory_item_price')
  }

  // Ações da página
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
  shouldHaveTitle(title) {
    this.pageTitle.should('contain', title)
    return this
  }

  shouldHaveItemCount(count) {
    if (count === 0) {
      this.cartItems.should('not.exist')
    } else {
      this.cartItems.should('have.length', count)
    }
    return this
  }

  shouldContainProduct(productName) {
    this.getCartItem(productName).should('exist')
    return this
  }

  shouldNotContainProduct(productName) {
    cy.get('.cart_item .inventory_item_name').should('not.contain', productName)
    return this
  }

  shouldShowCorrectPrice(productName, expectedPrice) {
    this.getItemPrice(productName).should('contain', expectedPrice)
    return this
  }
}

export default CartPage

// =====================================================

// cypress/e2e/login-with-page-objects.cy.js
import LoginPage from '../pages/LoginPage'
import InventoryPage from '../pages/InventoryPage'

describe('🔐 Login Tests - Page Objects', () => {
  const loginPage = new LoginPage()
  const inventoryPage = new InventoryPage()

  beforeEach(() => {
    loginPage.visit()
  })

  it('✅ Deve fazer login com credenciais válidas', () => {
    loginPage
      .login('standard_user', 'secret_sauce')
      .shouldRedirectToInventory()

    inventoryPage
      .shouldHaveTitle('Products')
      .shouldHaveProductCount(6)
  })

  it('❌ Deve mostrar erro para credenciais inválidas', () => {
    loginPage
      .login('invalid_user', 'wrong_password')
      .shouldShowError('Username and password do not match')
  })

  it('❌ Deve mostrar erro para campos vazios', () => {
    loginPage
      .clickLogin()
      .shouldShowError('Username is required')
  })

  it('🧹 Deve limpar erro ao clicar no X', () => {
    loginPage
      .login('invalid_user', 'wrong_password')
      .shouldShowError()
      .clearError()

    loginPage.errorMessage.should('not.exist')
  })

  it('🔒 Deve fazer logout corretamente', () => {
    loginPage
      .login('standard_user', 'secret_sauce')
      .shouldRedirectToInventory()

    inventoryPage
      .logout()

    loginPage
      .shouldBeOnLoginPage()
  })
})

// =====================================================

// cypress/e2e/shopping-with-page-objects.cy.js
import LoginPage from '../pages/LoginPage'
import InventoryPage from '../pages/InventoryPage'
import CartPage from '../pages/CartPage'

describe('🛒 Shopping Tests - Page Objects', () => {
  const loginPage = new LoginPage()
  const inventoryPage = new InventoryPage()
  const cartPage = new CartPage()

  beforeEach(() => {
    // Login antes de cada teste
    cy.loginAsStandardUser()
  })

  it('✅ Deve adicionar produto ao carrinho', () => {
    inventoryPage
      .addProductToCart('sauce-labs-backpack')
      .shouldShowCartBadge(1)
  })

  it('✅ Deve adicionar múltiplos produtos', () => {
    inventoryPage
      .addProductToCart('sauce-labs-backpack')
      .addProductToCart('sauce-labs-bike-light')
      .addProductToCart('sauce-labs-bolt-t-shirt')
      .shouldShowCartBadge(3)
  })

  it('✅ Deve remover produto do inventário', () => {
    inventoryPage
      .addProductToCart('sauce-labs-backpack')
      .shouldShowCartBadge(1)
      .removeProductFromCart('sauce-labs-backpack')
      .shouldNotShowCartBadge()
  })

  it('✅ Deve visualizar carrinho com produtos', () => {
    inventoryPage
      .addProductToCart('sauce-labs-backpack')
      .addProductToCart('sauce-labs-bike-light')
      .goToCart()

    cartPage
      .shouldHaveTitle('Your Cart')
      .shouldHaveItemCount(2)
      .shouldContainProduct('Sauce Labs Backpack')
      .shouldContainProduct('Sauce Labs Bike Light')
  })

  it('✅ Deve remover produto do carrinho', () => {
    inventoryPage
      .addProductToCart('sauce-labs-backpack')
      .goToCart()

    cartPage
      .shouldHaveItemCount(1)
      .removeItem('Sauce Labs Backpack')
      .shouldHaveItemCount(0)
  })

  it('✅ Deve continuar comprando do carrinho', () => {
    inventoryPage
      .addProductToCart('sauce-labs-backpack')
      .goToCart()

    cartPage
      .continueShopping()

    inventoryPage
      .shouldHaveTitle('Products')
      .shouldShowCartBadge(1)
  })

  it('✅ Fluxo completo: Adicionar → Ver Carrinho → Continuar Comprando → Checkout', () => {
    // Adicionar produtos
    inventoryPage
      .addProductToCart('sauce-labs-backpack')
      .addProductToCart('sauce-labs-bike-light')

    // Ver carrinho
    inventoryPage.goToCart()
    cartPage
      .shouldHaveItemCount(2)
      .shouldContainProduct('Sauce Labs Backpack')

    // Continuar comprando
    cartPage.continueShopping()
    inventoryPage.addProductToCart('sauce-labs-bolt-t-shirt')

    // Finalizar
    inventoryPage.goToCart()
    cartPage
      .shouldHaveItemCount(3)
      .proceedToCheckout()

    // Verificar redirecionamento
    cy.url().should('include', '/checkout-step-one')
  })
})

// =====================================================

// cypress/support/commands.js
import LoginPage from '../pages/LoginPage'
import InventoryPage from '../pages/InventoryPage'

// Comando para login rápido
Cypress.Commands.add('loginAsStandardUser', () => {
  const loginPage = new LoginPage()
  
  loginPage
    .visit()
    .login('standard_user', 'secret_sauce')
    .shouldRedirectToInventory()
})

// Comando para login com usuário específico
Cypress.Commands.add('loginAs', (username, password) => {
  const loginPage = new LoginPage()
  
  loginPage
    .visit()
    .login(username, password)
})

// Comando para adicionar produto usando Page Object
Cypress.Commands.add('addProductViaUI', (productId) => {
  const inventoryPage = new InventoryPage()
  inventoryPage.addProductToCart(productId)
})

// Comando para limpar carrinho completamente
Cypress.Commands.add('clearCart', () => {
  const inventoryPage = new InventoryPage()
  const cartPage = new CartPage()
  
  inventoryPage.goToCart()
  
  cy.get('body').then($body => {
    if ($body.find('.cart_item').length > 0) {
      cy.get('.cart_item .inventory_item_name').each($item => {
        const productName = $item.text()
        cartPage.removeItem(productName)
      })
    }
  })
})

// Comando para setup de teste com produtos no carrinho
Cypress.Commands.add('setupCartWithProducts', (products) => {
  cy.loginAsStandardUser()
  
  const inventoryPage = new InventoryPage()
  
  products.forEach(productId => {
    inventoryPage.addProductToCart(productId)
  })
})
