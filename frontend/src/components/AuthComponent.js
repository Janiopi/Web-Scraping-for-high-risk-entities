import authService from '../services/authService.js';

class AuthComponent {
  constructor() {
    this.currentView = 'login'; // 'login' o 'register'
    this.isLoading = false;
    this.render();
    this.attachEventListeners();
  }

  render() {
    const authContainer = document.getElementById('auth-container');
    if (!authContainer) return;

    authContainer.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
          <div>
            <div class="text-center">
              <i class="fas fa-shield-alt text-4xl text-blue-600 mb-4"></i>
              <h2 class="text-3xl font-extrabold text-gray-900">
                ${this.currentView === 'login' ? 'Login' : 'Sign in'}
              </h2>
              <p class="mt-2 text-sm text-gray-600">
                ${
                  this.currentView === 'login'
                    ? 'Access to your account'
                    : 'Create a new account'
                }
              </p>
            </div>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-gray-200">
            <button 
              id="login-tab" 
              class="flex-1 py-2 px-4 text-center border-b-2 font-medium text-sm ${
                this.currentView === 'login'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }"
            >
              <i class="fas fa-sign-in-alt mr-2"></i>Log In
            </button>
            <button 
              id="register-tab" 
              class="flex-1 py-2 px-4 text-center border-b-2 font-medium text-sm ${
                this.currentView === 'register'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }"
            >
              <i class="fas fa-user-plus mr-2"></i>Sign in
            </button>
          </div>

          <!-- Form -->
          <form id="auth-form" class="mt-8 space-y-6">
            <div class="space-y-4">
              
              ${
                this.currentView === 'register'
                  ? `
                <div>
                  <label for="username" class="block text-sm font-medium text-gray-700">
                    <i class="fas fa-user mr-2"></i>User Name
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Type your user name  "
                  />
                </div>
              `
                  : ''
              }

              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">
                  <i class="fas fa-envelope mr-2"></i>Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-gray-700">
                  <i class="fas fa-lock mr-2"></i>Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="password123"
                />
              </div>
            </div>

            <!-- Error Message -->
            <div id="error-message" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <i class="fas fa-exclamation-triangle mr-2"></i>
              <span id="error-text"></span>
            </div>

            <!-- Success Message -->
            <div id="success-message" class="hidden bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              <i class="fas fa-check-circle mr-2"></i>
              <span id="success-text"></span>
            </div>

            <!-- Submit Button -->
            <div>
              <button
                type="submit"
                id="submit-btn"
                class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                ${this.isLoading ? 'disabled' : ''}
              >
                ${
                  this.isLoading
                    ? `
                  <i class="fas fa-spinner fa-spin mr-2"></i>
                  ${
                    this.currentView === 'login'
                      ? 'Initialzing...'
                      : 'Registering...'
                  }
                `
                    : `
                  <i class="fas fa-${
                    this.currentView === 'login' ? 'sign-in-alt' : 'user-plus'
                  } mr-2"></i>
                  ${this.currentView === 'login' ? 'Log In' : 'Create Account'}
                `
                }
              </button>
            </div>

            <!-- Demo Users -->
            <div class="mt-6 bg-gray-50 p-4 rounded-md">
              <h4 class="text-sm font-medium text-gray-700 mb-2">
                <i class="fas fa-info-circle mr-2"></i>Usuarios de Prueba:
              </h4>
              <div class="text-xs text-gray-600 space-y-1">
                <div><strong>Admin:</strong> admin@example.com / admin123</div>
                <div><strong>Usuario:</strong> user@example.com / user123</div>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Switch between login y registro
    document.getElementById('login-tab')?.addEventListener('click', () => {
      this.currentView = 'login';
      this.render();
      this.attachEventListeners();
    });

    document.getElementById('register-tab')?.addEventListener('click', () => {
      this.currentView = 'register';
      this.render();
      this.attachEventListeners();
    });

    // Manage forms submit
    document
      .getElementById('auth-form')
      ?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleSubmit(e);
      });
  }

  async handleSubmit(e) {
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const username = formData.get('username');

    // Basic validations
    if (!email || !password) {
      this.showError('Complete all fields, please');
      return;
    }

    if (this.currentView === 'register' && !username) {
      this.showError('The user name is required');
      return;
    }

    // Show loading
    this.isLoading = true;
    this.updateSubmitButton();
    this.hideMessages();

    try {
      let result;

      if (this.currentView === 'login') {
        result = await authService.login(email, password);
      } else {
        result = await authService.register(username, email, password);
      }

      if (result.success) {
        this.showSuccess(
          `${
            this.currentView === 'login'
              ? 'Session initialized'
              : 'Account created'
          } succesfully. ¡Welcome ${result.user.username}!`
        );

        // Redirect to dashboard after  2 seg
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent('auth-success', { detail: result.user })
          );
        }, 2000);
      } else {
        this.showError(result.error || 'Error in authentication');
      }
    } catch (error) {
      console.error('Auth error:', error);
      this.showError('Error in conection. Please, try again.');
    } finally {
      this.isLoading = false;
      this.updateSubmitButton();
    }
  }

  updateSubmitButton() {
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
      submitBtn.disabled = this.isLoading;
      submitBtn.innerHTML = this.isLoading
        ? `
        <i class="fas fa-spinner fa-spin mr-2"></i>
        ${this.currentView === 'login' ? 'Initializing...' : 'Registerting...'}
      `
        : `
        <i class="fas fa-${
          this.currentView === 'login' ? 'sign-in-alt' : 'user-plus'
        } mr-2"></i>
        ${this.currentView === 'login' ? 'Log in' : 'Create Account'}
      `;
    }
  }

  showError(message) {
    const errorDiv = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    if (errorDiv && errorText) {
      errorText.textContent = message;
      errorDiv.classList.remove('hidden');
    }

    this.hideSuccess();
  }

  showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    const successText = document.getElementById('success-text');

    if (successDiv && successText) {
      successText.textContent = message;
      successDiv.classList.remove('hidden');
    }

    this.hideError();
  }

  hideError() {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
      errorDiv.classList.add('hidden');
    }
  }

  hideSuccess() {
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
      successDiv.classList.add('hidden');
    }
  }

  hideMessages() {
    this.hideError();
    this.hideSuccess();
  }
}

export default AuthComponent;
