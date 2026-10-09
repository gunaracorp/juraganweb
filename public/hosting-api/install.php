<?php
/**
 * JuraganWebsite - Install Wizard (jalankan SEKALI di shared hosting)
 *
 * Buka: https://domain-anda/hosting-api/install.php
 *
 * Wizard akan:
 *  1. Cek koneksi MySQL
 *  2. Buat semua tabel dari schema.sql
 *  3. Buat admin default (username/password dari config.php)
 *  4. Seed data awal (settings, services, posts, portfolio, testimonials)
 *  5. Tampilkan status & hapus diri sendiri (opsional)
 *
 * PENTING: Hapus file ini setelah install selesai untuk keamanan!
 */
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

$step = $_GET['step'] ?? 'check';
$messages = [];
$errors   = [];

function slugify(string $s): string {
    $s = strtolower(trim($s));
    $s = preg_replace('/[^a-z0-9]+/', '-', $s);
    return trim($s, '-');
}

function rand_id(): string {
    return 'c' . substr(bin2hex(random_bytes(12)), 0, 24);
}

function create_default_admin(): array {
    $cfg = require __DIR__ . '/config.php';
    $username = $cfg['auth']['default_username'];
    $password = $cfg['auth']['default_password'];
    $existing = DB::conn()->prepare('SELECT id FROM ' . DB::table('admins') . ' WHERE username = ?');
    $existing->execute([$username]);
    if ($existing->fetch()) return ['skipped' => true, 'username' => $username];
    $id = rand_id();
    $stmt = DB::conn()->prepare(
        'INSERT INTO ' . DB::table('admins') . ' (id, username, password, name, email, role) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $id, $username, hash_password($password),
        'Administrator JuraganWebsite', 'juraganwebsite10@gmail.com', 'superadmin'
    ]);
    return ['created' => true, 'username' => $username, 'password' => $password];
}

function seed_settings(): int {
    $rows = [
        ['siteName','JuraganWebsite','JuraganWebsite'],
        ['tagline','Jasa Pembuatan Website Profesional Sejak 2007','Professional Website Creation Service Since 2007'],
        ['description','Mitra terpercaya pembuatan website profesional Indonesia.','Trusted partner for professional website creation in Indonesia.'],
        ['address','Jl. Sudirman Kav. 52-53, Jakarta Selatan 12190, Indonesia','Jl. Sudirman Kav. 52-53, South Jakarta 12190, Indonesia'],
        ['phone','+62 812-3455-9556','+62 812-3455-9556'],
        ['email','juraganwebsite10@gmail.com','juraganwebsite10@gmail.com'],
        ['whatsapp','6281234559556','6281234559556'],
        ['branchTasikmalaya','Perumahan Andalusia Garden Cluster Granada No.11, Mangkubumi, Mangkubumi, Kota Tasikmalaya, Jawa Barat, Indonesia','Perumahan Andalusia Garden Cluster Granada No.11, Mangkubumi, Mangkubumi, Kota Tasikmalaya, Jawa Barat, Indonesia'],
        ['branchBandung','Jln. Muararajeun Lama No.26, Kel. Cihaurgeulis, Kecamatan Cibeunying Kaler, Kota Bandung, Jawa Barat, Indonesia 40122','Jln. Muararajeun Lama No.26, Kel. Cihaurgeulis, Kecamatan Cibeunying Kaler, Kota Bandung, Jawa Barat, Indonesia 40122'],
        ['facebook','https://facebook.com/juraganwebsite','https://facebook.com/juraganwebsite'],
        ['instagram','https://instagram.com/juraganwebsite','https://instagram.com/juraganwebsite'],
        ['twitter','https://x.com/juraganwebsite','https://x.com/juraganwebsite'],
        ['linkedin','https://linkedin.com/company/juraganwebsite','https://linkedin.com/company/juraganwebsite'],
        ['youtube','https://youtube.com/@juraganwebsite','https://youtube.com/@juraganwebsite'],
    ];
    $count = 0;
    foreach ($rows as $r) {
        $stmt = DB::conn()->prepare(
            'INSERT IGNORE INTO ' . DB::table('settings') . ' (id, `key`, valueId, valueEn) VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([rand_id(), $r[0], $r[1], $r[2]]);
        $count += $stmt->rowCount();
    }
    return $count;
}

function seed_services(): int {
    $items = [
        ['website-company-profile','Website Company Profile','Company Profile Website','Website profesional untuk menampilkan profil perusahaan, layanan, dan portofolio bisnis Anda secara online.','Professional website to showcase your company profile, services, and business portfolio online.','Globe',1500000,'Rp 1.500.000','Desain custom modern|Mobile responsive|SEO friendly|Form kontak|Gratis domain .web.id 1 tahun|Hosting gratis 6 bulan',1,1],
        ['toko-online','Toko Online / E-Commerce','Online Store / E-Commerce','Jual produk online dengan sistem keranjang, pembayaran, dan manajemen produk yang mudah.','Sell products online with cart system, payment, and easy product management.','ShoppingCart',3500000,'Rp 3.500.000','Keranjang belanja|Payment gateway|Manajemen stok|Laporan penjualan|Multi kurir|Integrasi WhatsApp',1,2],
        ['aplikasi-web','Aplikasi Web Custom','Custom Web Application','Aplikasi web sesuai kebutuhan bisnis: sistem informasi, dashboard, manajemen, dan lainnya.','Web applications tailored to your business: information systems, dashboards, management tools, and more.','Code',5000000,'Rp 5.000.000','Custom development|Database terstruktur|User management|API integration|Dashboard analitik|Training tim',1,3],
        ['hosting-domain','Hosting & Domain','Hosting & Domain','Hosting cepat andal dan registrasi domain murah untuk website Anda.','Fast reliable hosting and affordable domain registration for your website.','Server',99000,'Rp 99.000/bln','SSD storage|SSL gratis|Email bisnis|cPanel lengkap|Backup harian|Uptime 99.9%',1,4],
        ['seo-marketing','SEO & Digital Marketing','SEO & Digital Marketing','Optimasi mesin pencari dan kampanye digital marketing untuk meningkatkan traffic dan penjualan.','Search engine optimization and digital marketing campaigns to boost traffic and sales.','TrendingUp',1000000,'Rp 1.000.000/bln','Audit SEO|Keyword research|On-page optimization|Google Ads|Meta ads|Laporan bulanan',1,5],
        ['maintenance','Maintenance & Support','Maintenance & Support','Pemeliharaan website berkala, update konten, backup, dan dukungan teknis 24/7.','Regular website maintenance, content updates, backup, and 24/7 technical support.','Wrench',350000,'Rp 350.000/bln','Update konten|Backup berkala|Security monitoring|Performance tuning|Support WhatsApp|Laporan bulanan',1,6],
    ];
    $count = 0;
    foreach ($items as $s) {
        $stmt = DB::conn()->prepare(
            'INSERT IGNORE INTO ' . DB::table('services') . ' (id, slug, titleId, titleEn, descId, descEn, icon, price, priceLabel, features, active, `order`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
        );
        $stmt->execute([rand_id(), ...$s]);
        $count += $stmt->rowCount();
    }
    return $count;
}

function seed_portfolio(): int {
    $items = [
        ['arofahajj','Arofah Hajj - Portal Haji & Umroh Internasional','Arofah Hajj - International Hajj & Umroh Portal','Ekosistem portal haji dan umroh internasional yang mengintegrasikan layanan ibadah haji dan umroh dengan teknologi digital modern. Platform lengkap untuk calon jamaah dengan informasi paket, jadwal, dan panduan ibadah.','International hajj and umroh portal ecosystem integrating hajj and umroh services with modern digital technology. A complete platform for prospective pilgrims with package info, schedules, and worship guides.','Web App','Arofah Hajj','https://arofahajj.com','/portfolio/arofahajj.jpg',2024,1],
        ['kopnusa','KMN Berdikari - Koperasi Korporasi Multipihak Nusa','KMN Berdikari - Multi-Stakeholder Cooperative of Nusa','Portal resmi Koperasi Korporasi Multipihak Nusa Berdikari Merah Putih Indonesia. Mengintegrasikan 83.763 desa, 5 Kelompok Pihak Anggota (KPA), 9 Pilar Kampung, marketplace zonasi, dan logistik untuk kesejahteraan dari desa untuk dunia.','Official portal of the Multi-Stakeholder Cooperative of Nusa Berdikari Indonesia. Integrating 83,763 villages, 5 Stakeholder Groups, 9 Village Pillars, marketplace zoning, and logistics for welfare from villages to the world.','Web App','KMN Berdikari','https://www.kopnusa.id','/portfolio/kopnusa.jpg',2024,1],
        ['nusaparadise','Nusa Paradise - Portal Wisata Peradaban Terbesar di Dunia','Nusa Paradise - Largest Civilization Tourism Portal in the World','Kapal peradaban yang membawa 17.504 pulau, 714 suku bangsa, 1.300 bahasa daerah, dan seluruh kekayaan alam Indonesia berlayar menuju surga dunia yang nyata. Portal wisata terlengkap untuk eksplorasi keindahan Indonesia.','A civilization ship carrying 17,504 islands, 714 ethnic groups, 1,300 regional languages, and all of Indonesia natural wealth sailing towards a true paradise on earth. The most complete tourism portal for exploring Indonesian beauty.','Web App','Nusa Paradise','https://www.nusaparadise.id','/portfolio/nusaparadise.jpg',2024,1],
        ['indonesiaemas2030','Indonesia Emas 2030 - Platform Percepatan Transformasi','Indonesia Emas 2030 - Transformation Acceleration Platform','Roadmap dan platform percepatan Indonesia Emas 2030. Transformasi dari visi 2045 menjadi realitas 2030 melalui digitalisasi, kesehatan gratis, pendidikan gratis, dan pemberdayaan seluruh rakyat Indonesia.','Roadmap and acceleration platform for Indonesia Emas 2030. Transformation from the 2045 vision into 2030 reality through digitalization, free healthcare, free education, and empowerment of all Indonesian people.','Web App','Indonesia Emas 2030','https://indonesiaemas2030.id','/portfolio/indonesiaemas2030.jpg',2024,1],
        ['pusatperizinan','Pusat Perizinan - Urus Semua Izin Usaha Tinggal Terima Beres','Pusat Perizinan - Get All Business Licenses Done Hassle-Free','Konsultan perizinan usaha terbaik Indonesia: NIB 1 hari, pendirian PT 3 hari, sertifikasi halal, izin BPOM/PIRT, PBG & SLF, izin lingkungan, PMA, izin umroh (PPIU) & haji (PPIH), registrasi IATA, dan berbagai izin lainnya.','Best business licensing consultant in Indonesia: NIB in 1 day, PT establishment in 3 days, halal certification, BPOM/PIRT permits, PBG & SLF, environmental permits, PMA, umroh (PPIU) & hajj (PPIH) permits, IATA registration, and more.','Company Profile','Pusat Perizinan','https://www.pusatperizinan.com','/portfolio/pusatperizinan.jpg',2024,1],
        ['mesin-pendingin','Sentra Indoklima - Pusat Kompresor AC dan Pendingin','Sentra Indoklima - AC Compressor and Refrigeration Center','Pusat kompresor AC dan pendingin terlengkap. Menyediakan berbagai mesin pendingin untuk kebutuhan industri, komersial, dan residensial dengan kualitas terjamin dan harga bersaing.','The most complete AC compressor and refrigeration center. Providing various refrigeration machines for industrial, commercial, and residential needs with guaranteed quality and competitive prices.','E-Commerce','Sentra Indoklima','https://mesin-pendingin.com','/portfolio/mesin-pendingin.jpg',2023,0],
        ['tirisglobal','PT Tiris Global Indonesia - Distributor Kompresor AC dan Freon','PT Tiris Global Indonesia - AC Compressor and Freon Distributor','Distributor resmi kompresor AC dan freon terpercaya di Indonesia. Menyediakan produk AC berkualitas dari berbagai brand ternama dengan layanan profesional dan pengiriman ke seluruh Indonesia.','Trusted official distributor of AC compressors and freon in Indonesia. Providing quality AC products from various well-known brands with professional service and nationwide shipping.','Company Profile','PT Tiris Global Indonesia','https://tirisglobal.com','/portfolio/tirisglobal.jpg',2024,1],
    ];
    $count = 0;
    foreach ($items as $p) {
        $stmt = DB::conn()->prepare(
            'INSERT IGNORE INTO ' . DB::table('portfolios') . ' (id, slug, titleId, titleEn, descId, descEn, category, client, url, image, year, featured) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
        );
        $stmt->execute([rand_id(), ...$p]);
        $count += $stmt->rowCount();
    }
    return $count;
}

function seed_testimonials(): int {
    $items = [
        ['H. Ahmad Fauzi','Arofah Hajj','CEO & Founder','Portal haji dan umroh yang dibuat JuraganWebsite sangat membantu jamaah kami. Sistem pendaftaran online mempermudah proses, dan desainnya sangat profesional. Recommended!','The hajj and umroh portal created by JuraganWebsite greatly helps our pilgrims. The online registration system simplifies the process, and the design is very professional. Highly recommended!',5,'AF'],
        ['Bambang Sutrisno','KMN Berdikari','Ketua Koperasi','Website koperasi kami yang mengintegrasikan 83.763 desa berhasil dibangun dengan sempurna oleh JuraganWebsite. Sistem marketplace zonasi dan logistiknya berjalan lancar.','Our cooperative website integrating 83,763 villages was built perfectly by JuraganWebsite. The marketplace zoning and logistics systems run smoothly.',5,'BS'],
        ['Putri Anggraini','Nusa Paradise','Direktur Pemasaran','Nusa Paradise kini menjadi portal wisata terlengkap di Indonesia berkat JuraganWebsite. Tampilannya memukau dan fiturnya sangat lengkap untuk promosi pariwisata Indonesia.','Nusa Paradise is now the most complete tourism portal in Indonesia thanks to JuraganWebsite. The appearance is stunning and the features are very complete for Indonesian tourism promotion.',5,'PA'],
        ['Dr. Hendra Wijaya','Indonesia Emas 2030','Ketua Inisiatif','Platform percepatan Indonesia Emas 2030 yang dibangun JuraganWebsite menjadi tulang punggung digital transformasi kami. Sangat membantu menyebarkan visi 2030 ke seluruh Indonesia.','The Indonesia Emas 2030 acceleration platform built by JuraganWebsite is the backbone of our digital transformation. Very helpful in spreading the 2030 vision throughout Indonesia.',5,'HW'],
        ['Rudi Santoso','Pusat Perizinan','CEO','Sebagai konsultan perizinan terbaik Indonesia, kami butuh website yang bisa menampilkan layanan kompleks dengan jelas. JuraganWebsite berhasil mewujudkannya dengan sempurna!','As the best licensing consultant in Indonesia, we need a website that can display complex services clearly. JuraganWebsite managed to realize it perfectly!',5,'RS'],
        ['Indra Kusuma','PT Tiris Global Indonesia','Direktur Utama','Website distributor kami yang dibuat JuraganWebsite sangat profesional dan mudah dikelola. Penjualan kompresor AC dan freon kami meningkat signifikan setelah website live.','Our distributor website made by JuraganWebsite is very professional and easy to manage. Our AC compressor and freon sales increased significantly after the website went live.',5,'IK']
    ];
    $count = 0;
    foreach ($items as $t) {
        $stmt = DB::conn()->prepare(
            'INSERT IGNORE INTO ' . DB::table('testimonials') . ' (id, name, company, role, messageId, messageEn, rating, avatar, active, `order`) VALUES (?,?,?,?,?,?,?,?,?,?)'
        );
        $stmt->execute([rand_id(), ...$t, 1, $count + 1]);
        $count += $stmt->rowCount();
    }
    return $count;
}

function seed_posts(): int {
    $items = [
        [
            '5-alasan-website-untuk-bisnis-2025',
            '5 Alasan Kenapa Bisnismu Wajib Punya Website di 2025',
            '5 Reasons Your Business Must Have a Website in 2025',
            'Di era digital, website bukan lagi pilihan tapi kebutuhan. Simak 5 alasan strategis kenapa bisnismu harus online tahun ini.',
            'In the digital era, a website is no longer an option but a necessity. Discover 5 strategic reasons your business must go online this year.',
            "Di tahun 2025, kehadiran online bukan lagi sekadar pelengkap, melainkan tulang punggung bisnis yang sukses. Survei terbaru menunjukkan 87% konsumen Indonesia mencari produk di internet sebelum membeli.\n\n## 1. Kredibilitas dan Kepercayaan\nWebsite profesional membuat bisnismu terlihat lebih kredibel. Konsumen cenderung percaya pada bisnis yang memiliki website dibanding yang hanya punya media sosial.\n\n## 2. Buka 24 Jam\nWebsite bekerja tanpa henti. Konsumen bisa mendapatkan informasi kapan saja, bahkan di luar jam kerja.\n\n## 3. Pasar Lebih Luas\nDengan website, target pasar tidak lagi terbatas geografis. Bisnis kecil di Bandung bisa melayani pelanggan di Aceh atau bahkan mancanegara.\n\n## 4. SEO untuk Visibilitas\nWebsite yang dioptimasi SEO muncul di hasil pencarian Google, membawa calon pembeli langsung ke bisnismu.\n\n## 5. Data dan Analitik\nWebsite memungkinkanmu mengumpulkan data perilaku pengunjung, sumber traffic, dan tingkat konversi untuk pengambilan keputusan yang lebih baik.\n\n## Kesimpulan\nWebsite adalah investasi dengan ROI jangka panjang. Hubungi JuraganWebsite untuk konsultasi gratis pembuatan website profesional.",
            "In 2025, online presence is no longer a complement but the backbone of a successful business. Recent surveys show 87% of Indonesian consumers search for products online before purchasing.\n\n## 1. Credibility and Trust\nA professional website makes your business look more credible. Consumers tend to trust businesses with websites more than those with only social media.\n\n## 2. Open 24 Hours\nA website works non-stop. Customers can get information anytime, even outside business hours.\n\n## 3. Broader Market\nWith a website, your target market is no longer geographically limited. A small business in Bandung can serve customers in Aceh or even abroad.\n\n## 4. SEO for Visibility\nAn SEO-optimized website appears in Google search results, bringing potential buyers directly to your business.\n\n## 5. Data and Analytics\nA website allows you to collect visitor behavior data, traffic sources, and conversion rates for better decision-making.\n\n## Conclusion\nA website is a long-term ROI investment. Contact JuraganWebsite for a free professional website creation consultation.",
            'Bisnis','website,bisnis,digital,umkm','/blog/5-alasan-website-untuk-bisnis-2025.jpg','Andi Pratama',1,1
        ],
        [
            'tips-memilih-jasa-pembuatan-website',
            '7 Tips Memilih Jasa Pembuatan Website Terpercaya',
            '7 Tips for Choosing a Trusted Website Creation Service',
            'Jangan sampai salah pilih vendor. Ini 7 kriteria penting memilih jasa pembuatan website profesional.',
            'Don\'t make the wrong vendor choice. Here are 7 important criteria for choosing a professional website creation service.',
            "Memilih jasa pembuatan website yang tepat adalah keputusan krusial. Berikut 7 tips dari tim JuraganWebsite berdasarkan 17 tahun pengalaman.\n\n## 1. Cek Portofolio\nLihat hasil kerja mereka. Apakah desainnya modern, responsif, dan beragam?\n\n## 2. Testimoni Klien\nBaca ulasan dari klien sebelumnya. Testimoni asli lebih berharga dari sekadar janji.\n\n## 3. Pengalaman\nVendor dengan pengalaman 5+ tahun biasanya lebih reliabel dalam menghadapi berbagai skenario.\n\n## 4. Harga Transparan\nPastikan tidak ada biaya tersembunyi. Mintakan rincian harga yang jelas.\n\n## 5. Dukungan Pasca-Live\nWebsite butuh maintenance. Pastikan ada dukungan teknis setelah launching.\n\n## 6. Teknologi Terkini\nTanyakan teknologi yang digunakan. Hindari teknologi usang yang sulit dimaintain.\n\n## 7. Garansi Layanan\nVendor profesional biasanya memberi garansi atas karyanya.",
            "Choosing the right website creation service is a crucial decision. Here are 7 tips from JuraganWebsite's team based on 17 years of experience.\n\n## 1. Check Portfolio\nSee their work results. Are the designs modern, responsive, and diverse?\n\n## 2. Client Testimonials\nRead reviews from previous clients. Authentic testimonials are more valuable than just promises.\n\n## 3. Experience\nVendors with 5+ years of experience are usually more reliable in handling various scenarios.\n\n## 4. Transparent Pricing\nMake sure there are no hidden costs. Ask for clear pricing details.\n\n## 5. Post-Launch Support\nWebsites need maintenance. Ensure there's technical support after launch.\n\n## 6. Current Technology\nAsk about the technology used. Avoid outdated tech that's hard to maintain.\n\n## 7. Service Guarantee\nProfessional vendors usually offer guarantees on their work.",
            'Bisnis','tips,jasa,website,panduan','/blog/tips-memilih-jasa-pembuatan-website.jpg','Sari Wulandari',0,1
        ],
        [
            'panduan-seo-untuk-pemula',
            'Panduan SEO untuk Pemula: Dari Nol ke Halaman Pertama Google',
            'SEO Guide for Beginners: From Zero to Google\'s First Page',
            'Belajar SEO dari dasar. Praktik sederhana yang bisa langsung kamu terapkan untuk website bisnismu.',
            'Learn SEO from scratch. Simple practices you can immediately apply to your business website.',
            "SEO (Search Engine Optimization) adalah seni dan ilmu membuat website muncul di hasil pencarian Google. Berikut panduan dasarnya.\n\n## Apa itu SEO?\nSEO adalah proses mengoptimasi website agar muncul di posisi tinggi hasil pencarian organik (tidak berbayar).\n\n## 1. Riset Kata Kunci\nTemukan kata kunci yang dicari target audiensmu. Gunakan tools seperti Google Keyword Planner atau Ubersuggest.\n\n## 2. Konten Berkualitas\nBuat konten yang menjawab pertanyaan pengguna secara komprehensif. Konten panjang (1500+ kata) cenderung lebih baik.\n\n## 3. On-Page SEO\nOptimasi judul, meta description, URL, dan heading (H1, H2, H3).\n\n## 4. Mobile Friendly\nPastikan website ramah mobile. Google memprioritaskan mobile-first indexing.\n\n## 5. Kecepatan Loading\nWebsite cepat = ranking lebih baik. Target < 3 detik.\n\n## 6. Backlink Berkualitas\nDapatkan link dari situs otoritatif. Kualitas > kuantitas.\n\nSEO adalah maraton, bukan sprint. Konsistensi adalah kunci.",
            "SEO (Search Engine Optimization) is the art and science of making a website appear in Google search results. Here's the basic guide.\n\n## What is SEO?\nSEO is the process of optimizing a website to rank high in organic (unpaid) search results.\n\n## 1. Keyword Research\nFind keywords your target audience searches for. Use tools like Google Keyword Planner or Ubersuggest.\n\n## 2. Quality Content\nCreate content that comprehensively answers user questions. Long content (1500+ words) tends to perform better.\n\n## 3. On-Page SEO\nOptimize title, meta description, URL, and headings (H1, H2, H3).\n\n## 4. Mobile Friendly\nMake sure your website is mobile-friendly. Google prioritizes mobile-first indexing.\n\n## 5. Loading Speed\nFast website = better ranking. Target < 3 seconds.\n\n## 6. Quality Backlinks\nGet links from authoritative sites. Quality > quantity.\n\nSEO is a marathon, not a sprint. Consistency is key.",
            'Digital Marketing','seo,pemula,panduan,google','/blog/panduan-seo-untuk-pemula.jpg','Budi Santoso',1,1
        ],
        [
            'toko-online-vs-marketplace',
            'Toko Online vs Marketplace: Mana yang Lebih Untung?',
            'Online Store vs Marketplace: Which is More Profitable?',
            'Perbandingan lengkap keuntungan dan kerugian punya toko online sendiri vs jual di marketplace.',
            'Complete comparison of the pros and cons of having your own online store vs selling on marketplaces.',
            "Banyak pelaku bisnis bingung: buat toko online sendiri atau jual di Tokopedia/Shopee? Mari kita bedah.\n\n## Toko Online Sendiri\n**Kelebihan:** Branding penuh, tidak ada biaya komisi, data pelanggan 100% milikmu, bebas aturan marketplace.\n**Kekurangan:** Perlu upaya marketing lebih, biaya awal pembuatan, perlu maintain sendiri.\n\n## Marketplace\n**Kelebihan:** Traffic sudah ada, mulai cepat, sistem pembayaran terpercaya.\n**Kekurangan:** Komisi per transaksi, persaingan ketat, tidak ada branding.\n\n## Solusi Terbaik: Keduanya\nStrategi paling cerdas adalah menggunakan keduanya. Marketplace untuk volume, toko online untuk brand dan loyalitas.",
            "Many business owners wonder: build their own online store or sell on Tokopedia/Shopee? Let's break it down.\n\n## Own Online Store\n**Pros:** Full branding, no commission fees, 100% customer data ownership, free from marketplace rules.\n**Cons:** Needs more marketing effort, initial creation cost, self-maintenance needed.\n\n## Marketplace\n**Pros:** Existing traffic, quick start, trusted payment system.\n**Cons:** Per-transaction commission, fierce competition, no branding.\n\n## Best Solution: Both\nThe smartest strategy is to use both. Marketplace for volume, online store for brand and loyalty.",
            'Bisnis','toko online,marketplace,e-commerce,bisnis','/blog/toko-online-vs-marketplace.jpg','Maya Anggraini',0,1
        ],
        [
            'tutorial-responsive-design',
            'Tutorial Responsive Design dengan Tailwind CSS',
            'Responsive Design Tutorial with Tailwind CSS',
            'Pelajari cara membuat website yang tampil sempurna di semua ukuran layar dengan Tailwind CSS.',
            'Learn how to create a website that looks perfect on all screen sizes with Tailwind CSS.',
            "Responsive design adalah pendekatan web design yang membuat website tampil optimal di semua perangkat.\n\n## Mengapa Penting?\nLebih dari 60% traffic web kini dari mobile. Google juga menggunakan mobile-first indexing.\n\n## Breakpoint Tailwind\nTailwind menyediakan breakpoint default: sm (640px), md (768px), lg (1024px), xl (1280px).\n\n## Tips Praktis\n1. Gunakan grid dan flexbox\n2. Hindari ukuran fixed, gunakan rem/percent\n3. Test di device asli\n\n## Contoh Kode\n```html\n<div class=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\">\n  <div>Card 1</div>\n  <div>Card 2</div>\n</div>\n```\n\nDengan Tailwind, responsive design menjadi jauh lebih mudah!",
            "Responsive design is a web design approach that makes a website display optimally on all devices.\n\n## Why Important?\nOver 60% of web traffic is now from mobile. Google also uses mobile-first indexing.\n\n## Tailwind Breakpoints\nTailwind provides default breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px).\n\n## Practical Tips\n1. Use grid and flexbox\n2. Avoid fixed sizes, use rem/percent\n3. Test on real devices\n\n## Code Example\n```html\n<div class=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\">\n  <div>Card 1</div>\n  <div>Card 2</div>\n</div>\n```\n\nWith Tailwind, responsive design becomes much easier!",
            'Web Development','tailwind,responsive,css,tutorial','/blog/tutorial-responsive-design.jpg','Rizki Hidayat',0,1
        ],
    ];
    $count = 0;
    foreach ($items as $p) {
        $stmt = DB::conn()->prepare(
            'INSERT IGNORE INTO ' . DB::table('posts') . ' (id, slug, titleId, titleEn, excerptId, excerptEn, contentId, contentEn, category, tags, coverImage, author, featured, published, views) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
        );
        $stmt->execute([rand_id(), ...$p, rand(100, 5000)]);
        $count += $stmt->rowCount();
    }
    return $count;
}

function seed_pages(): int {
    $items = [
        ['tentang-kami','Tentang Kami','About Us','Konten halaman tentang kami.','About us page content.','default',1,0],
        ['kebijakan-privasi','Kebijakan Privasi','Privacy Policy','Kebijakan privasi data pengguna.','Privacy policy content.','default',1,1],
        ['syarat-ketentuan','Syarat & Ketentuan','Terms & Conditions','Syarat dan ketentuan layanan.','Terms and conditions of service.','default',1,2],
        ['faq','Pertanyaan Umum (FAQ)','Frequently Asked Questions','Pertanyaan yang sering diajukan.','Frequently asked questions.','default',1,3],
    ];
    $count = 0;
    foreach ($items as $p) {
        $stmt = DB::conn()->prepare(
            'INSERT IGNORE INTO ' . DB::table('pages') . ' (id, slug, titleId, titleEn, contentId, contentEn, excerptId, excerptEn, template, status, showInMenu, menuOrder) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
        );
        $stmt->execute([rand_id(), $p[0], $p[1], $p[2], $p[3], $p[4], '', '', $p[5], 'published', $p[6], $p[7]]);
        $count += $stmt->rowCount();
    }
    return $count;
}

function seed_menus(): int {
    $items = [
        ['main-menu','Menu Utama','header',json_encode([
            ['type'=>'page','label'=>'Beranda','url'=>'/','order'=>0],
            ['type'=>'section','label'=>'Tentang','url'=>'#about','order'=>1],
            ['type'=>'section','label'=>'Layanan','url'=>'#services','order'=>2],
            ['type'=>'section','label'=>'Portofolio','url'=>'#portfolio','order'=>3],
            ['type'=>'section','label'=>'Blog','url'=>'#blog','order'=>4],
            ['type'=>'section','label'=>'Testimoni','url'=>'#testimonials','order'=>5],
            ['type'=>'section','label'=>'Kontak','url'=>'#contact','order'=>6],
        ])],
        ['footer-menu-1','Footer Perusahaan','footer',json_encode([
            ['type'=>'section','label'=>'Tentang','url'=>'#about'],
            ['type'=>'section','label'=>'Layanan','url'=>'#services'],
            ['type'=>'section','label'=>'Portofolio','url':'#portfolio'],
        ])],
        ['footer-menu-2','Footer Layanan','footer',json_encode([
            ['type'=>'service','label'=>'Website Company Profile','url':'#services'],
            ['type'=>'service','label':'Toko Online','url':'#services'],
        ])],
    ];
    $count = 0;
    foreach ($items as $m) {
        $stmt = DB::conn()->prepare(
            'INSERT IGNORE INTO ' . DB::table('menus') . ' (id, slug, name, location, items) VALUES (?,?,?,?,?)'
        );
        $stmt->execute([rand_id(), $m[0], $m[1], $m[2], $m[3]]);
        $count += $stmt->rowCount();
    }
    return $count;
}

function seed_categories(): int {
    $items = [
        ['umum','Umum','General','Artikel umum seputar website dan bisnis'],
        ['bisnis','Bisnis','Business','Tips dan strategi bisnis online'],
        ['tutorial','Tutorial','Tutorial','Panduan teknis pembuatan website'],
        ['digital-marketing','Digital Marketing','Digital Marketing','Strategi pemasaran digital'],
        ['web-development','Web Development','Web Development','Teknis pengembangan website'],
    ];
    $count = 0;
    foreach ($items as $c) {
        $stmt = DB::conn()->prepare(
            'INSERT IGNORE INTO ' . DB::table('categories') . ' (id, slug, nameId, nameEn, description) VALUES (?,?,?,?,?)'
        );
        $stmt->execute([rand_id(), $c[0], $c[1], $c[2], $c[3]]);
        $count += $stmt->rowCount();
    }
    return $count;
}

function seed_tags(): int {
    $tags = ['website','bisnis','digital','umkm','seo','tutorial','css','tailwind','e-commerce','marketplace','panduan','tips'];
    $count = 0;
    foreach ($tags as $t) {
        $stmt = DB::conn()->prepare(
            'INSERT IGNORE INTO ' . DB::table('tags') . ' (id, slug, name) VALUES (?,?,?)'
        );
        $stmt->execute([rand_id(), $t, ucfirst($t)]);
        $count += $stmt->rowCount();
    }
    return $count;
}

function seed_seo_settings(): int {
    $items = [
        ['seoMetaTitle','JuraganWebsite - Jasa Pembuatan Website Profesional Sejak 2007','JuraganWebsite - Professional Website Creation Service Since 2007'],
        ['seoMetaDescription','Mitra terpercaya pembuatan website profesional Indonesia sejak 2007.','Trusted partner for professional website creation in Indonesia since 2007.'],
        ['seoMetaKeywords','jasa website, pembuatan website, toko online, hosting, seo','website service, website creation, online store, hosting, seo'],
        ['seoOgTitle','JuraganWebsite - Jasa Pembuatan Website Profesional','JuraganWebsite - Professional Website Creation Service'],
        ['seoOgDescription','Mitra terpercaya pembuatan website profesional Indonesia sejak 2007.','Trusted partner for professional website creation in Indonesia since 2007.'],
        ['seoOgImage','https://juraganwebsite.web.id/og-image.jpg','https://juraganwebsite.web.id/og-image.jpg'],
        ['seoTwitterCard','summary_large_image','summary_large_image'],
        ['seoRobotsTxt','User-agent: *\nAllow: /\nSitemap: https://juraganwebsite.web.id/sitemap.xml','User-agent: *\nAllow: /\nSitemap: https://juraganwebsite.web.id/sitemap.xml'],
        ['seoSitemap','https://juraganwebsite.web.id/sitemap.xml','https://juraganwebsite.web.id/sitemap.xml'],
    ];
    $count = 0;
    foreach ($items as $s) {
        $stmt = DB::conn()->prepare(
            'INSERT IGNORE INTO ' . DB::table('settings') . ' (id, `key`, valueId, valueEn) VALUES (?,?,?,?)'
        );
        $stmt->execute([rand_id(), $s[0], $s[1], $s[2]]);
        $count += $stmt->rowCount();
    }
    return $count;
}

function seed_activity(): int {
    $items = [
        ['system','System','installed','system',null,'JuraganWebsite installed','Installation completed'],
    ];
    $count = 0;
    foreach ($items as $a) {
        $stmt = DB::conn()->prepare(
            'INSERT IGNORE INTO ' . DB::table('activities') . ' (id, userId, userName, action, entity, entityId, entityTitle, details) VALUES (?,?,?,?,?,?,?,?)'
        );
        $stmt->execute([rand_id(), $a[0], $a[1], $a[2], $a[3], $a[4], $a[5], $a[6]]);
        $count += $stmt->rowCount();
    }
    return $count;
}

// === Run steps ===
header('Content-Type: text/html; charset=utf-8');
$cfg = require __DIR__ . '/config.php';
$canSelfDelete = function_exists('unlink') && is_writable(__FILE__);
?>
<!DOCTYPE html>
<html lang="id"><head><meta charset="utf-8"><title>JuraganWebsite - Install Wizard</title>
<style>
  body{font-family:system-ui,-apple-system,sans-serif;background:linear-gradient(135deg,#f5f3ff,#eff6ff);min-height:100vh;margin:0;padding:2rem;color:#1e1b3a}
  .card{max-width:780px;margin:2rem auto;background:#fff;border-radius:16px;box-shadow:0 20px 50px -10px rgba(139,92,246,.2);padding:2rem 2.5rem}
  h1{color:#7c3aed;margin-top:0;font-size:1.6rem}h2{color:#2563eb;font-size:1.05rem;margin-top:1.5rem}
  .step{padding:.7rem 1rem;border-radius:8px;margin:.5rem 0;background:#f5f3ff;border-left:4px solid #7c3aed}
  .ok{background:#dcfce7;border-left-color:#16a34a}.err{background:#fee2e2;border-left-color:#dc2626}.warn{background:#fef3c7;border-left-color:#d97706}
  code{background:#1e1b3a;color:#a78bfa;padding:.1rem .4rem;border-radius:4px;font-size:.85rem}
  a{color:#2563eb}.btn{display:inline-block;padding:.6rem 1.2rem;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin:.4rem .2rem}
  ul{line-height:1.7}
</style></head>
<body><div class="card">
<h1>🚀 JuraganWebsite — Install Wizard</h1>
<p>PT Digital Bisnis Manajemen (Digiman) — Setup untuk shared hosting cPanel.</p>

<?php
if ($step === 'check'):
    // Step 1: cek requirements
    $checks = [
        'PHP 7.4+'        => version_compare(PHP_VERSION, '7.4.0', '>='),
        'PDO MySQL'        => extension_loaded('pdo_mysql'),
        'mbstring'         => extension_loaded('mbstring'),
        'config.php writable' => is_writable(__DIR__ . '/config.php'),
        'uploads dir writable' => is_writable(__DIR__ . '/../uploads') || mkdir(__DIR__ . '/../uploads', 0755, true),
    ];
    $allOk = true;
    foreach ($checks as $k => $v) {
        echo '<div class="step ' . ($v ? 'ok' : 'err') . '">' . ($v ? '✓' : '✗') . ' <b>' . $k . '</b></div>';
        if (!$v) $allOk = false;
    }
    // Test DB connection
    try {
        $pdo = DB::conn();
        echo '<div class="step ok">✓ <b>Database MySQL</b> terhubung: ' . $cfg['db']['name'] . '@' . $cfg['db']['host'] . '</div>';
    } catch (Throwable $e) {
        echo '<div class="step err">✗ <b>Database MySQL</b>: gagal — ' . $e->getMessage() . '</div>';
        echo '<div class="step warn">Edit <code>config.php</code> di folder <code>hosting-api</code> dengan kredensial MySQL dari cPanel.</div>';
        $allOk = false;
    }
    if ($allOk):
?>
  <h2>Semua persyaratan terpenuhi ✓</h2>
  <p>Wizard akan: (1) membuat semua tabel, (2) membuat admin default, (3) mengisi data awal.</p>
  <a class="btn" href="?step=install">▶ Mulai Install</a>
<?php
    else:
?>
  <h2>Perbaiki dulu ✗</h2>
  <p>Setelah semua checklist hijau, klik tombol install.</p>
  <a class="btn" href="?step=check">↻ Cek Ulang</a>
<?php
    endif;
?>

<?php elseif ($step === 'install'):
    try {
        // Step 2: Run schema.sql
        $sql = file_get_contents(__DIR__ . '/schema.sql');
        // Replace prefix if custom
        $prefix = $cfg['db']['prefix'];
        if ($prefix !== 'jw_') {
            $sql = str_replace('jw_', $prefix, $sql);
        }
        // Split by ';' at end of statements (simple)
        $statements = array_filter(array_map('trim', explode(';', $sql)));
        $tableCount = 0;
        foreach ($statements as $stmt) {
            if (empty($stmt) || strpos($stmt, '--') === 0) continue;
            DB::conn()->exec($stmt);
            if (preg_match('/CREATE TABLE/i', $stmt)) $tableCount++;
        }
        echo '<div class="step ok">✓ <b>' . $tableCount . ' tabel</b> berhasil dibuat di database.</div>';

        // Step 3: Create admin
        $admin = create_default_admin();
        if (!empty($admin['skipped'])) {
            echo '<div class="step warn">⚠ Admin <code>' . htmlspecialchars($admin['username']) . '</code> sudah ada (dilewati).</div>';
        } else {
            echo '<div class="step ok">✓ Admin default dibuat — username: <code>' . htmlspecialchars($admin['username']) . '</code>, password: <code>' . htmlspecialchars($admin['password']) . '</code></div>';
        }

        // Step 4: Seed data
        $s = seed_settings();  echo '<div class="step ok">✓ Settings: ' . $s . ' baris</div>';
        $s = seed_seo_settings(); echo '<div class="step ok">✓ SEO Settings: ' . $s . ' baris</div>';
        $s = seed_services();  echo '<div class="step ok">✓ Services: ' . $s . ' baris</div>';
        $s = seed_portfolio(); echo '<div class="step ok">✓ Portfolio: ' . $s . ' baris</div>';
        $s = seed_testimonials(); echo '<div class="step ok">✓ Testimonials: ' . $s . ' baris</div>';
        $s = seed_posts();     echo '<div class="step ok">✓ Posts: ' . $s . ' artikel</div>';
        $s = seed_pages();     echo '<div class="step ok">✓ Pages: ' . $s . ' halaman</div>';
        $s = seed_categories();echo '<div class="step ok">✓ Categories: ' . $s . ' kategori</div>';
        $s = seed_tags();      echo '<div class="step ok">✓ Tags: ' . $s . ' tags</div>';
        $s = seed_menus();     echo '<div class="step ok">✓ Menus: ' . $s . ' menu</div>';
        $s = seed_activity();  echo '<div class="step ok">✓ Activity: ' . $s . ' log awal</div>';

        echo '<h2>🎉 Install Selesai!</h2>';
        echo '<p>Website JuraganWebsite siap digunakan.</p>';
        echo '<ul>';
        echo '<li>🌐 Buka: <a href="../"><code>/</code> (halaman publik)</a></li>';
        echo '<li>🔐 CMS Admin: <a href="../#admin"><code>/#admin</code></a> atau klik tombol "CMS Admin" di header</li>';
        echo '<li>Login: <code>admin</code> / <code>juragan2007</code> (ganti password segera!)</li>';
        echo '</ul>';
        echo '<h2>⚠️ PENTING: Hapus file install.php</h2>';
        echo '<p>Untuk keamanan, hapus file <code>install.php</code> dari folder <code>hosting-api</code> setelah install berhasil.</p>';
        if ($canSelfDelete):
            echo '<a class="btn" href="?step=cleanup" onclick="return confirm(\'Hapus install.php?\')">🗑 Hapus install.php otomatis</a>';
        else:
            echo '<div class="step warn">Hapus manual via cPanel File Manager: <code>/public_html/hosting-api/install.php</code></div>';
        endif;
        echo '<a class="btn" href="../">→ Buka Website</a>';
    } catch (Throwable $e) {
        echo '<div class="step err">✗ Install gagal: ' . htmlspecialchars($e->getMessage()) . '</div>';
        echo '<a class="btn" href="?step=check">↻ Mulai Ulang</a>';
    }
    ?>
<?php elseif ($step === 'cleanup'):
    $self = __FILE__;
    if (@unlink($self)):
        echo '<div class="step ok">✓ install.php berhasil dihapus.</div>';
        echo '<a class="btn" href="../">→ Buka Website</a>';
    else:
        echo '<div class="step warn">⚠ Tidak bisa hapus otomatis. Hapus manual via cPanel File Manager: <code>/public_html/hosting-api/install.php</code></div>';
        echo '<a class="btn" href="../">→ Buka Website</a>';
    endif;
    echo '<p>Setup selesai. Selamat berkarya! 🎉</p>';
?>
<?php endif; ?>

<hr style="margin-top:2rem;border:none;border-top:1px solid #e5e7eb">
<p style="font-size:.8rem;color:#6b7280">JuraganWebsite by PT Digital Bisnis Manajemen (Digiman) — sejak 2007</p>
</div></body></html>
