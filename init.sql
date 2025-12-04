-- init.sql

-- Set postgres user password with scram-sha-256 encryption
ALTER ROLE postgres WITH PASSWORD 'admin123';

-- Hapus tabel jika ada (untuk reset, hati-hati dalam production)
DROP TABLE IF EXISTS update_resep;
DROP TABLE IF EXISTS favorit;
DROP TABLE IF EXISTS resep;
DROP TABLE IF EXISTS kategori;
DROP TABLE IF EXISTS users;

-- Buat tabel users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,     
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buat tabel kategori
CREATE TABLE kategori (
    id SERIAL PRIMARY KEY,
    nama_kategori VARCHAR(150) NOT NULL
);

-- Insert data ke tabel kategori
INSERT INTO kategori (nama_kategori)
VALUES
('Daging'),
('Ikan'),
('Makanan Cepat saji'),
('Sayuran'),
('Makanan penutup');

-- Buat tabel resep
CREATE TABLE resep (
    id SERIAL PRIMARY KEY,
    nama_resep VARCHAR(150) NOT NULL,
    deskripsi TEXT,
    ingredients TEXT,
    kategori_id INTEGER,
    gambar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kategori_id) REFERENCES kategori(id)
);

-- Insert data ke tabel resep
INSERT INTO resep (nama_resep, deskripsi, ingredients, kategori_id, gambar)
VALUES
('Ayam Geprek', 
 'Ayam goreng sambal bawang pedas.', 
 'Ayam, cabai, bawang', 
 1, 
 'https://img-global.cpcdn.com/recipes/df40bcf6eefca280/680x781cq80/ayam-geprek-simple-foto-resep-utama.jpg'),

('Tumis Labu Siam Rebon Wortel',
 'Sayur labu dan wortel yang dipadu.',
 E'1 buah labu siam
1 buah wortel
1 sdm rebon
100 ml air
5 siung bawang merah
3 siung bawang putih
2 cabe merah
1 sdm saus tiram
1 sdt gula
1 sdt kaldu
1/2 sdt garam',
 4,
 'https://img-global.cpcdn.com/recipes/a840f3239356f864/300x426f0.5_0.5_1.0q80/tumis-labu-siam-rebon-wortel-foto-resep-utama.webp'),

('Ikan Nila Segar Asam Manis',
 'Perpaduan ikan nila dengan nanas dan bombai.',
 E'Ikan nila 1 ekor
Nanas
Bawang bombay
Bawang putih
Bawang merah
Tomat
Cabe merah
Daun bawang
Saus tomat
Saus sambal
Penyedap
Garam
Merica',
 2,
 'https://img-global.cpcdn.com/recipes/e8a54ad3af478ddf/640x640sq80/photo.webp'),

('Kebab Ayam',
 'Ayam dan sayuran yang digabung.',
 E'3 roll wrap
Isian ayam
Tomat iris
Timun iris
Selada',
 3,
 'https://img-global.cpcdn.com/recipes/5fbf8244cf4d03e9/300x426f0.5_0.5_1.0q80/kebab-ayam-foto-resep-utama.webp'),

('Kolak Labu Kuning',
 'Perpaduan santan dengan pisang dan ubi dengan aroma daun pandan.',
 E'1/2 labu kuning
Gula merah
Santan
Garam
Air',
 5,
 'https://img-global.cpcdn.com/recipes/2b8ce47b5ff5e1da/300x426f0.5_0.506964_1.0q80/kolak-labu-kuning-foto-resep-utama.webp'),

('Rendang Daging Sapi Padang',
 'Daging sapi dengan bumbu lengkap.',
 E'500g daging sapi
750ml santan
Garam
Kecap
Cabai merah
Cabai pedas
Bawang merah
Bawang putih
Lengkuas
Serai
Bunga lawang
Kayu manis
Pala
Daun jeruk
Daun salam
Ketumbar bubuk',
 1,
 'https://img-global.cpcdn.com/recipes/2033c1003b3b3e86/300x426f0.5434_0.499372_1.00126q80/rendang-daging-sapi-padang-foto-resep-utama.webp');

-- Buat tabel favorit (yang sebelumnya terpotong)
CREATE TABLE favorit (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    resep_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (resep_id) REFERENCES resep(id)
);

-- Buat tabel update_resep
CREATE TABLE update_resep (
    id SERIAL PRIMARY KEY,
    resep_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    nama_resep VARCHAR(150),
    ingredients TEXT,
    deskripsi TEXT,
    gambar TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resep_id) REFERENCES resep(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Buat user dan beri hak akses
-- Hapus user jika sudah ada (opsional, hati-hati)
DROP USER IF EXISTS admin_user;
DROP USER IF EXISTS normal_user;

-- Buat user baru
CREATE USER admin_user WITH PASSWORD 'admin123';
CREATE USER normal_user WITH PASSWORD 'user123';

-- Beri hak akses ke admin_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin_user;

-- Beri hak akses ke normal_user
GRANT SELECT, INSERT ON resep, kategori, update_resep TO normal_user;
GRANT SELECT ON users TO normal_user;  -- mungkin normal_user boleh lihat users?
GRANT INSERT ON favorit TO normal_user;  -- normal_user bisa menambah favorit

-- Cabut hak DELETE/UPDATE dari normal_user
REVOKE DELETE, UPDATE ON resep, kategori FROM normal_user;

-- Buat fungsi dan trigger untuk update timestamp
CREATE OR REPLACE FUNCTION update_resep_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.created_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_resep
BEFORE UPDATE ON resep
FOR EACH ROW
EXECUTE FUNCTION update_resep_timestamp();

-- Buat view
CREATE OR REPLACE VIEW view_resep_kategori AS
SELECT 
    r.id,
    r.nama_resep,
    r.deskripsi,
    r.ingredients,
    r.gambar,
    k.nama_kategori
FROM resep r
JOIN kategori k ON r.kategori_id = k.id;

-- Buat view favorit user
CREATE OR REPLACE VIEW view_favorit_user AS
SELECT u.username, r.nama_resep
FROM favorit f
JOIN users u ON f.user_id = u.id
JOIN resep r ON f.resep_id = r.id;