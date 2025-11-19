-- Initialize database with sample data

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and components'),
('Clothing', 'Apparel and fashion items'),
('Food & Beverages', 'Food products and drinks'),
('Books', 'Books and publications'),
('Home & Garden', 'Home improvement and garden supplies')
ON CONFLICT (name) DO NOTHING;

-- Insert sample suppliers
INSERT INTO suppliers (name, email, phone, address) VALUES
('TechCorp Inc', 'contact@techcorp.com', '+1-555-0101', '123 Tech Street, Silicon Valley, CA'),
('Fashion World Ltd', 'info@fashionworld.com', '+1-555-0202', '456 Fashion Ave, New York, NY'),
('Global Foods Co', 'sales@globalfoods.com', '+1-555-0303', '789 Food Boulevard, Chicago, IL'),
('Book Publishers LLC', 'orders@bookpub.com', '+1-555-0404', '321 Library Lane, Boston, MA'),
('Home Depot Plus', 'support@homedepot.com', '+1-555-0505', '654 Garden Way, Seattle, WA')
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, quantity, sku, category_id, supplier_id) VALUES
('Laptop Pro 15', 'High-performance laptop with 16GB RAM and 512GB SSD', 1299.99, 25, 'LAP-001', 1, 1),
('Wireless Mouse', 'Ergonomic wireless mouse with 2-year battery life', 29.99, 150, 'ACC-001', 1, 1),
('Cotton T-Shirt', '100% organic cotton t-shirt, various colors', 19.99, 200, 'CLO-001', 2, 2),
('Running Shoes', 'Lightweight running shoes with cushioned sole', 89.99, 75, 'CLO-002', 2, 2),
('Organic Coffee Beans', 'Premium organic coffee beans, 1kg pack', 24.99, 100, 'FOD-001', 3, 3),
('JavaScript: The Definitive Guide', 'Comprehensive guide to JavaScript programming', 59.99, 50, 'BOK-001', 4, 4),
('Garden Tool Set', 'Complete set of 5 essential garden tools', 49.99, 80, 'HOM-001', 5, 5)
ON CONFLICT (sku) DO NOTHING;


