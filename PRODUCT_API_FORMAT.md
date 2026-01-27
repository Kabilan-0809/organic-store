# Product API Response Format

## Field Specifications

| Type | Property Name | Description |
|------|---------------|-------------|
| String | product_id | Unique ID for the product |
| String | title | Product name |
| String | description | Short description of the product |
| Number | original_price | MRP (Maximum Retail Price) |
| Number | sale_price | Current selling price (after discount) |
| String | category | Category name |
| Number | shipping_weight | Weight in grams |
| **Number** | **availability** | **Actual stock count (0 if out of stock)** |
| String | link | Product link (full URL) |
| String | primary_image | Single primary image URL |
| Array | additional_images | Array of additional image URLs |

---

## Example Response

### Regular Product (Millet)
```json
{
  "product_id": "cmjiujo07000cnbcidptz93ob",
  "title": "Multi Millet Tangy Tomato",
  "description": "Multi Millet Tangy Tomato is a wholesome...",
  "original_price": 80,
  "sale_price": 72,
  "category": "Millets",
  "shipping_weight": 300,
  "availability": 94,
  "link": "http://localhost:3000/shop/Multi_Millet_Tangy_Tomato",
  "primary_image": "/products/millets/Tangy Tomato.jpg",
  "additional_images": []
}
```

### Variant Product (Malt) - Expanded
```json
{
  "product_id": "cmjiujnln0005nbciw0iotni2-e220fa3e-0f85-420e-bb9e-0b45b2e080e5",
  "title": "Red Banana Malt - 80g",
  "description": "Red Banana Malt is a naturally nourishing...",
  "original_price": 120,
  "sale_price": 108,
  "category": "Malt",
  "shipping_weight": 80,
  "availability": 100,
  "link": "http://localhost:3000/shop/Red_Banana_Malt",
  "primary_image": "/products/malt/Red Banana Malt.png",
  "additional_images": [
    "/products/malt/Red_Banana_Malt/IMG_1545.jpg",
    "/products/malt/Red_Banana_Malt/IMG_1546.jpg"
  ]
}
```

---

## API Endpoints

### 1. Fetch All Products
**Endpoint:** `GET /api/products`

**Description:** List all products with unique product_id for catalog

**Query Parameters:**
- `excludeOutOfStock` (boolean): Filter out products with no stock
- `category` (string): Filter by category name
- `q` or `search` (string): Search products by name

---

### 2. Fetch All Categories
**Endpoint:** `GET /api/categories`

**Description:** List all unique categories with product counts

---

### 3. Fetch Products in Category
**Endpoint:** `GET /api/products?category={categoryName}`

**Description:** List products within a particular category

---

### 4. Fetch Product by Slug
**Endpoint:** `GET /api/products/{slug}`

**Description:** Get single product details using product slug

---

### 5. Search Products by Name
**Endpoint:** `GET /api/products/search?q={searchTerm}`

**Description:** Search products matching the name (partial match)

---

## Key Notes

✅ **Availability** - Shows actual stock count (e.g., 94, 100) instead of binary 0/1  
✅ **Variant Expansion** - Malt/Saadha Podi products are split into separate entries per size  
✅ **Sale Price** - Automatically calculated from original_price and discount  
✅ **Full URLs** - Product links include complete domain  
✅ **Shipping Weight** - Variant-specific for Malt products, default 300g for others
