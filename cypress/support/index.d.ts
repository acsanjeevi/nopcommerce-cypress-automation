export interface CategoryRecord {
  categoryName: string;
  description?: string;
  parentCategory?: string;
}

export interface ProductRecord {
  productName: string;
  sku: string;
  price: string;
  description?: string;
  stock?: string;
  category?: string;
}

export interface UserRecord {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

export interface OrderRecord {
  customer: string;
  product: string;
  quantity?: string;
  shippingAddress?: string;
}

export interface CheckoutData {
  billingName?: string;
  billingAddress?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
}

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsCustomer(): Chainable<void>;
      loginAsAdmin(): Chainable<void>;

      waitForSpinnerToDisappear(): Chainable<void>;
      deleteRecords(
        recordsName: string,
        confirmMsg: string,
        toastMsg: string,
        searchApi: string,
        clearApi: string,
        deleteApi: string
      ): Chainable<void>;
      validateHeaders(expectedHeaders: string[], maxColumns: number): Chainable<void>;
      searchAndValidateInTable(searchText: string, searchApi: string): Chainable<void>;
      selectedQuickFilter(filterLabel: string, columnSelector: string, expectedValue: string): Chainable<void>;
      validateContextMenu(triggerSelector: string, menuItemSelector: string, expectedItems: string[]): Chainable<void>;
      overviewButtons(buttonSelectors: string[]): Chainable<void>;
      clickRefreshButton(api: string): Chainable<void>;

      loadCategoriesOverview(): Chainable<void>;
      clickOnAddCategories(): Chainable<void>;
      createCategories(data: CategoryRecord): Chainable<void>;
      editCategories(recordName: string): Chainable<void>;
      validateCategoriesContextMenu(): Chainable<void>;

      loadProductsOverview(): Chainable<void>;
      clickOnAddProducts(): Chainable<void>;
      createProducts(data: ProductRecord): Chainable<void>;
      editProducts(recordName: string): Chainable<void>;
      validateProductsContextMenu(): Chainable<void>;

      loadUsersOverview(): Chainable<void>;
      clickOnAddUsers(): Chainable<void>;
      createUsers(data: UserRecord): Chainable<void>;
      editUsers(recordName: string): Chainable<void>;
      validateUsersContextMenu(): Chainable<void>;

      loadOrdersOverview(): Chainable<void>;
      clickOnAddOrders(): Chainable<void>;
      createOrders(data: OrderRecord): Chainable<void>;
      editOrders(searchText: string): Chainable<void>;
      validateOrdersContextMenu(): Chainable<void>;

      loadProductsPage(): Chainable<void>;
      loadCartPage(): Chainable<void>;
      addProductToCart(productName: string): Chainable<void>;
      removeCartItem(productName: string): Chainable<void>;
      applyCouponCode(couponCode: string): Chainable<void>;
      proceedToCheckout(checkoutData: CheckoutData): Chainable<void>;
    }
  }
}
