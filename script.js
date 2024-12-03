// Yupoo Configuration (keeping for reference)
window.VERSION = '4.26.33';
// ... (other config)

class ProductManager {
    constructor() {
        this.productsGrid = document.getElementById('productsGrid');
    }

    async fetchProducts() {
        try {
            const apiUrl = 'https://joyabuy.com/search-info/get-tb-shop-full';
            const headers = {
                'accept': '*/*',
                'accept-language': 'en-GB,en;q=0.9',
                'referer': 'https://joyabuy.com/shops/',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin'
            };

            // Fetch both pages concurrently
            const [page1Response, page2Response] = await Promise.all([
                fetch(`${apiUrl}?${new URLSearchParams({
                    ShopId: '473803271',
                    Page: '1',
                    Language: 'en'
                })}`, { headers }),
                fetch(`${apiUrl}?${new URLSearchParams({
                    ShopId: '473803271',
                    Page: '2',
                    Language: 'en'
                })}`, { headers })
            ]);

            if (!page1Response.ok || !page2Response.ok) {
                throw new Error(`HTTP error! status: ${page1Response.status} ${page2Response.status}`);
            }

            const [page1Data, page2Data] = await Promise.all([
                page1Response.json(),
                page2Response.json()
            ]);
            
            // Combine products from both pages
            const allProducts = [
                ...page1Data.data.shopProducts.productList,
                ...page2Data.data.shopProducts.productList
            ].map(product => ({
                title: product.name,
                image: product.imgUrl,
                price: `¥${product.price}`,
                link: `https://item.taobao.com/item.htm?id=${product.id}`,
                sold: product.sold
            }));
            
            return [{
                title: "All Products",
                products: allProducts
            }];
        } catch (error) {
            console.error('Error fetching products:', error);
            return [{
                title: "Error Loading Products",
                products: [{
                    title: "Please try again later",
                    image: "https://via.placeholder.com/300",
                    price: "N/A",
                    link: "#"
                }]
            }];
        }
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        card.innerHTML = `
            <a href="${product.link}" target="_blank">
                <img src="${product.image}" alt="${product.title}" loading="lazy">
                <div class="product-info">
                    <div class="product-details">
                        <h3>${product.title}</h3>
                    </div>
                    <div class="price-info">
                        <span class="price">${product.price}</span>
                        ${product.sold ? `<span class="sold">${product.sold} sold</span>` : ''}
                    </div>
                </div>
            </a>
        `;
        
        return card;
    }

    createCategorySection(category) {
        const productsGrid = document.createElement('div');
        productsGrid.className = 'products-grid';
        
        category.products.forEach(product => {
            productsGrid.appendChild(this.createProductCard(product));
        });
        
        return productsGrid;
    }

    async displayProducts() {
        this.productsGrid.innerHTML = '<div class="loading">Loading products...</div>';
        
        try {
            const categories = await this.fetchProducts();
            this.productsGrid.innerHTML = '';
            
            categories.forEach(category => {
                const section = this.createCategorySection(category);
                this.productsGrid.appendChild(section);
            });
        } catch (error) {
            this.productsGrid.innerHTML = `
                <div class="error">
                    <p>Unable to load products. Please try again later.</p>
                    <a href="https://shop236556112.taobao.com" target="_blank" class="error-link">
                        Visit Taobao Store
                    </a>
                </div>
            `;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const productManager = new ProductManager();
    productManager.displayProducts();
    
    // Add smooth scrolling for mobile
    if (window.innerWidth < 768) {
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Optional: Add scroll snapping
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (window.innerWidth < 768) {
                    e.preventDefault();
                    card.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
}); 