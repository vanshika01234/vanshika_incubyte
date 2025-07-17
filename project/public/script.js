class SweetShopApp {
    constructor() {
        this.baseUrl = '/api/sweets';
        this.currentSweets = [];
        this.currentSweetId = null;
        this.currentAction = null;
        this.init();
    }

    init() {
        this.loadSweets();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Search and filter controls
        document.getElementById('searchBtn').addEventListener('click', () => this.handleSearch());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearSearch());
        
        // Add sweet button
        document.getElementById('addSweetBtn').addEventListener('click', () => this.showAddSweetModal());
        
        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => this.hideModal('sweetModal'));
        document.getElementById('cancelForm').addEventListener('click', () => this.hideModal('sweetModal'));
        document.getElementById('closeQuantityModal').addEventListener('click', () => this.hideModal('quantityModal'));
        document.getElementById('cancelQuantity').addEventListener('click', () => this.hideModal('quantityModal'));
        
        // Form submissions
        document.getElementById('sweetForm').addEventListener('submit', (e) => this.handleSweetForm(e));
        document.getElementById('quantityForm').addEventListener('submit', (e) => this.handleQuantityForm(e));
        
        // Close modal on backdrop click
        document.getElementById('sweetModal').addEventListener('click', (e) => {
            if (e.target.id === 'sweetModal') this.hideModal('sweetModal');
        });
        document.getElementById('quantityModal').addEventListener('click', (e) => {
            if (e.target.id === 'quantityModal') this.hideModal('quantityModal');
        });
        
        // Search on enter key
        document.getElementById('searchName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
    }

    async loadSweets() {
        try {
            this.showLoading();
            const response = await fetch(this.baseUrl);
            const data = await response.json();
            
            if (data.success) {
                this.currentSweets = data.data;
                this.renderSweets(this.currentSweets);
            } else {
                this.showToast('Failed to load sweets', 'error');
            }
        } catch (error) {
            console.error('Error loading sweets:', error);
            this.showToast('Error loading sweets', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleSearch() {
        try {
            this.showLoading();
            const searchParams = new URLSearchParams();
            
            const name = document.getElementById('searchName').value.trim();
            const category = document.getElementById('searchCategory').value;
            const minPrice = document.getElementById('minPrice').value;
            const maxPrice = document.getElementById('maxPrice').value;
            
            if (name) searchParams.append('name', name);
            if (category) searchParams.append('category', category);
            if (minPrice) searchParams.append('minPrice', minPrice);
            if (maxPrice) searchParams.append('maxPrice', maxPrice);
            
            const response = await fetch(`${this.baseUrl}/search?${searchParams}`);
            const data = await response.json();
            
            if (data.success) {
                this.currentSweets = data.data;
                this.renderSweets(this.currentSweets);
                this.showToast(`Found ${data.data.length} sweets`, 'info');
            } else {
                this.showToast('Search failed', 'error');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showToast('Search error', 'error');
        } finally {
            this.hideLoading();
        }
    }

    clearSearch() {
        document.getElementById('searchName').value = '';
        document.getElementById('searchCategory').value = '';
        document.getElementById('minPrice').value = '';
        document.getElementById('maxPrice').value = '';
        this.loadSweets();
    }

    renderSweets(sweets) {
        const grid = document.getElementById('sweetsGrid');
        
        if (sweets.length === 0) {
            grid.innerHTML = `
                <div class="loading">
                    <p>No sweets found. Add some sweets to get started!</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = sweets.map(sweet => `
            <div class="sweet-card">
                <div class="sweet-header">
                    <div>
                        <h3 class="sweet-name">${this.escapeHtml(sweet.name)}</h3>
                        <span class="sweet-category">${this.escapeHtml(sweet.category)}</span>
                    </div>
                </div>
                <div class="sweet-details">
                    <div class="sweet-price">₹${sweet.price}</div>
                    <div class="sweet-quantity">Stock: ${sweet.quantity} units</div>
                    <span class="stock-status ${this.getStockStatus(sweet.quantity)}">
                        ${this.getStockStatusText(sweet.quantity)}
                    </span>
                </div>
                <div class="sweet-actions">
                    <button class="btn btn-primary" onclick="app.showPurchaseModal(${sweet.id})" 
                            ${sweet.quantity === 0 ? 'disabled' : ''}>
                        Purchase
                    </button>
                    <button class="btn btn-success" onclick="app.showRestockModal(${sweet.id})">
                        Restock
                    </button>
                    <button class="btn btn-warning" onclick="app.showEditSweetModal(${sweet.id})">
                        Edit
                    </button>
                    <button class="btn btn-danger" onclick="app.deleteSweet(${sweet.id})">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    getStockStatus(quantity) {
        if (quantity === 0) return 'out-of-stock';
        if (quantity < 10) return 'low-stock';
        return 'in-stock';
    }

    getStockStatusText(quantity) {
        if (quantity === 0) return 'Out of Stock';
        if (quantity < 10) return 'Low Stock';
        return 'In Stock';
    }

    showAddSweetModal() {
        document.getElementById('modalTitle').textContent = 'Add New Sweet';
        document.getElementById('sweetForm').reset();
        this.currentSweetId = null;
        this.showModal('sweetModal');
    }

    async showEditSweetModal(sweetId) {
        try {
            const response = await fetch(`${this.baseUrl}/${sweetId}`);
            const data = await response.json();
            
            if (data.success) {
                const sweet = data.data;
                document.getElementById('modalTitle').textContent = 'Edit Sweet';
                document.getElementById('sweetName').value = sweet.name;
                document.getElementById('sweetCategory').value = sweet.category;
                document.getElementById('sweetPrice').value = sweet.price;
                document.getElementById('sweetQuantity').value = sweet.quantity;
                
                this.currentSweetId = sweetId;
                this.showModal('sweetModal');
            } else {
                this.showToast('Failed to load sweet details', 'error');
            }
        } catch (error) {
            console.error('Error loading sweet:', error);
            this.showToast('Error loading sweet details', 'error');
        }
    }

    async handleSweetForm(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('sweetName').value.trim(),
            category: document.getElementById('sweetCategory').value,
            price: parseFloat(document.getElementById('sweetPrice').value),
            quantity: parseInt(document.getElementById('sweetQuantity').value)
        };
        
        // Validation
        if (!formData.name || !formData.category || formData.price < 0 || formData.quantity < 0) {
            this.showToast('Please fill all fields with valid values', 'error');
            return;
        }
        
        try {
            const url = this.currentSweetId ? `${this.baseUrl}/${this.currentSweetId}` : this.baseUrl;
            const method = this.currentSweetId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast(data.message || 'Sweet saved successfully', 'success');
                this.hideModal('sweetModal');
                this.loadSweets();
            } else {
                this.showToast(data.message || 'Failed to save sweet', 'error');
            }
        } catch (error) {
            console.error('Error saving sweet:', error);
            this.showToast('Error saving sweet', 'error');
        }
    }

    async deleteSweet(sweetId) {
        if (!confirm('Are you sure you want to delete this sweet?')) {
            return;
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/${sweetId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast('Sweet deleted successfully', 'success');
                this.loadSweets();
            } else {
                this.showToast(data.message || 'Failed to delete sweet', 'error');
            }
        } catch (error) {
            console.error('Error deleting sweet:', error);
            this.showToast('Error deleting sweet', 'error');
        }
    }

    showPurchaseModal(sweetId) {
        this.currentSweetId = sweetId;
        this.currentAction = 'purchase';
        document.getElementById('quantityModalTitle').textContent = 'Purchase Sweet';
        document.getElementById('quantitySubmit').textContent = 'Purchase';
        document.getElementById('quantityForm').reset();
        this.showModal('quantityModal');
    }

    showRestockModal(sweetId) {
        this.currentSweetId = sweetId;
        this.currentAction = 'restock';
        document.getElementById('quantityModalTitle').textContent = 'Restock Sweet';
        document.getElementById('quantitySubmit').textContent = 'Restock';
        document.getElementById('quantityForm').reset();
        this.showModal('quantityModal');
    }

    async handleQuantityForm(e) {
        e.preventDefault();
        
        const quantity = parseInt(document.getElementById('quantityAmount').value);
        
        if (!quantity || quantity <= 0) {
            this.showToast('Please enter a valid quantity', 'error');
            return;
        }
        
        try {
            const url = `${this.baseUrl}/${this.currentSweetId}/${this.currentAction}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast(data.message, 'success');
                this.hideModal('quantityModal');
                this.loadSweets();
            } else {
                this.showToast(data.message || `Failed to ${this.currentAction} sweet`, 'error');
            }
        } catch (error) {
            console.error(`Error ${this.currentAction} sweet:`, error);
            this.showToast(`Error ${this.currentAction} sweet`, 'error');
        }
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SweetShopApp();
});