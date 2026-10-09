import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";

const db = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function main() {
  console.log("🌱 Seeding JuraganWebsite database...");

  // Admin
  await db.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashPassword("juragan2007"),
      name: "Administrator JuraganWebsite",
      email: "juraganwebsite10@gmail.com",
      role: "superadmin",
    },
  });

  // Settings
  const settings = [
    { key: "siteName", valueId: "JuraganWebsite", valueEn: "JuraganWebsite" },
    { key: "tagline", valueId: "Jasa Pembuatan Website Profesional Sejak 2007", valueEn: "Professional Website Creation Service Since 2007" },
    { key: "description", valueId: "Mitra terpercaya pembuatan website profesional Indonesia.", valueEn: "Trusted partner for professional website creation in Indonesia." },
    { key: "address", valueId: "Jl. Sudirman Kav. 52-53, Jakarta Selatan 12190, Indonesia", valueEn: "Jl. Sudirman Kav. 52-53, South Jakarta 12190, Indonesia" },
    { key: "phone", valueId: "+62 812-3455-9556", valueEn: "+62 812-3455-9556" },
    { key: "email", valueId: "juraganwebsite10@gmail.com", valueEn: "juraganwebsite10@gmail.com" },
    { key: "whatsapp", valueId: "6281234559556", valueEn: "6281234559556" },
    { key: "branchTasikmalaya", valueId: "Perumahan Andalusia Garden Cluster Granada No.11, Mangkubumi, Mangkubumi, Kota Tasikmalaya, Jawa Barat, Indonesia", valueEn: "Perumahan Andalusia Garden Cluster Granada No.11, Mangkubumi, Mangkubumi, Kota Tasikmalaya, Jawa Barat, Indonesia" },
    { key: "branchBandung", valueId: "Jln. Muararajeun Lama No.26, Kel. Cihaurgeulis, Kecamatan Cibeunying Kaler, Kota Bandung, Jawa Barat, Indonesia 40122", valueEn: "Jln. Muararajeun Lama No.26, Kel. Cihaurgeulis, Kecamatan Cibeunying Kaler, Kota Bandung, Jawa Barat, Indonesia 40122" },
    { key: "facebook", valueId: "https://facebook.com/juraganwebsite", valueEn: "https://facebook.com/juraganwebsite" },
    { key: "instagram", valueId: "https://instagram.com/juraganwebsite", valueEn: "https://instagram.com/juraganwebsite" },
    { key: "twitter", valueId: "https://x.com/juraganwebsite", valueEn: "https://x.com/juraganwebsite" },
    { key: "linkedin", valueId: "https://linkedin.com/company/juraganwebsite", valueEn: "https://linkedin.com/company/juraganwebsite" },
    { key: "youtube", valueId: "https://youtube.com/@juraganwebsite", valueEn: "https://youtube.com/@juraganwebsite" },
  ];
  for (const s of settings) {
    await db.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  // Posts (Blog)
  const posts = [
    {
      slug: "5-alasan-website-untuk-bisnis-2025",
      titleId: "5 Alasan Kenapa Bisnismu Wajib Punya Website di 2025",
      titleEn: "5 Reasons Your Business Must Have a Website in 2025",
      excerptId: "Di era digital, website bukan lagi pilihan tapi kebutuhan. Simak 5 alasan strategis kenapa bisnismu harus online tahun ini.",
      excerptEn: "In the digital era, a website is no longer an option but a necessity. Discover 5 strategic reasons your business must go online this year.",
      contentId: `Di tahun 2025, kehadiran online bukan lagi sekadar pelengkap, melainkan tulang punggung bisnis yang sukses. Survei terbaru menunjukkan 87% konsumen Indonesia mencari produk di internet sebelum membeli.\n\n## 1. Kredibilitas dan Kepercayaan\nWebsite profesional membuat bisnismu terlihat lebih kredibel. Konsumen cenderung percaya pada bisnis yang memiliki website dibanding yang hanya punya media sosial.\n\n## 2. Buka 24 Jam\nWebsite bekerja tanpa henti. Konsumen bisa mendapatkan informasi kapan saja, bahkan di luar jam kerja.\n\n## 3. Pasar Lebih Luas\nDengan website, target pasar tidak lagi terbatas geografis. Bisnis kecil di Bandung bisa melayani pelanggan di Aceh atau bahkan mancanegara.\n\n## 4. SEO untuk Visibilitas\nWebsite yang dioptimasi SEO muncul di hasil pencarian Google, membawa calon pembeli langsung ke bisnismu.\n\n## 5. Data dan Analitik\nWebsite memungkinkanmu mengumpulkan data perilaku pengunjung, sumber traffic, dan tingkat konversi untuk pengambilan keputusan yang lebih baik.\n\n## Kesimpulan\nWebsite adalah investasi dengan ROI jangka panjang. Hubungi JuraganWebsite untuk konsultasi gratis pembuatan website profesional.`,
      contentEn: `In 2025, online presence is no longer a complement but the backbone of a successful business. Recent surveys show 87% of Indonesian consumers search for products online before purchasing.\n\n## 1. Credibility and Trust\nA professional website makes your business look more credible. Consumers tend to trust businesses with websites more than those with only social media.\n\n## 2. Open 24 Hours\nA website works non-stop. Customers can get information anytime, even outside business hours.\n\n## 3. Broader Market\nWith a website, your target market is no longer geographically limited. A small business in Bandung can serve customers in Aceh or even abroad.\n\n## 4. SEO for Visibility\nAn SEO-optimized website appears in Google search results, bringing potential buyers directly to your business.\n\n## 5. Data and Analytics\nA website allows you to collect visitor behavior data, traffic sources, and conversion rates for better decision-making.\n\n## Conclusion\nA website is a long-term ROI investment. Contact JuraganWebsite for a free professional website creation consultation.`,
      category: "Bisnis",
      tags: "website,bisnis,digital,umkm",
      coverImage: "/blog/5-alasan-website-untuk-bisnis-2025.jpg",
      author: "Andi Pratama",
      featured: true,
      published: true,
    },
    {
      slug: "tips-memilih-jasa-pembuatan-website",
      titleId: "7 Tips Memilih Jasa Pembuatan Website Terpercaya",
      titleEn: "7 Tips for Choosing a Trusted Website Creation Service",
      excerptId: "Jangan sampai salah pilih vendor. Ini 7 kriteria penting memilih jasa pembuatan website profesional.",
      excerptEn: "Don't make the wrong vendor choice. Here are 7 important criteria for choosing a professional website creation service.",
      contentId: `Memilih jasa pembuatan website yang tepat adalah keputusan krusial. Berikut 7 tips dari tim JuraganWebsite berdasarkan 17 tahun pengalaman.\n\n## 1. Cek Portofolio\nLihat hasil kerja mereka. Apakah desainnya modern, responsif, dan beragam?\n\n## 2. Testimoni Klien\nBaca ulasan dari klien sebelumnya. Testimoni asli lebih berharga dari sekadar janji.\n\n## 3. Pengalaman\nVendor dengan pengalaman 5+ tahun biasanya lebih reliabel dalam menghadapi berbagai skenario.\n\n## 4. Harga Transparan\nPastikan tidak ada biaya tersembunyi. Mintakan rincian harga yang jelas.\n\n## 5. Dukungan Pasca-Live\nWebsite butuh maintenance. Pastikan ada dukungan teknis setelah launching.\n\n## 6. Teknologi Terkini\nTanyakan teknologi yang digunakan. Hindari teknologi usang yang sulit dimaintain.\n\n## 7. Garansi Layanan\nVendor profesional biasanya memberi garansi atas karyanya.`,
      contentEn: `Choosing the right website creation service is a crucial decision. Here are 7 tips from JuraganWebsite's team based on 17 years of experience.\n\n## 1. Check Portfolio\nSee their work results. Are the designs modern, responsive, and diverse?\n\n## 2. Client Testimonials\nRead reviews from previous clients. Authentic testimonials are more valuable than just promises.\n\n## 3. Experience\nVendors with 5+ years of experience are usually more reliable in handling various scenarios.\n\n## 4. Transparent Pricing\nMake sure there are no hidden costs. Ask for clear pricing details.\n\n## 5. Post-Launch Support\nWebsites need maintenance. Ensure there's technical support after launch.\n\n## 6. Current Technology\nAsk about the technology used. Avoid outdated tech that's hard to maintain.\n\n## 7. Service Guarantee\nProfessional vendors usually offer guarantees on their work.`,
      category: "Bisnis",
      tags: "tips,jasa,website,panduan",
      coverImage: "/blog/tips-memilih-jasa-pembuatan-website.jpg",
      author: "Sari Wulandari",
      featured: false,
      published: true,
    },
    {
      slug: "panduan-seo-untuk-pemula",
      titleId: "Panduan SEO untuk Pemula: Dari Nol ke Halaman Pertama Google",
      titleEn: "SEO Guide for Beginners: From Zero to Google's First Page",
      excerptId: "Belajar SEO dari dasar. Praktik sederhana yang bisa langsung kamu terapkan untuk website bisnismu.",
      excerptEn: "Learn SEO from scratch. Simple practices you can immediately apply to your business website.",
      contentId: `SEO (Search Engine Optimization) adalah seni dan ilmu membuat website muncul di hasil pencarian Google. Berikut panduan dasarnya.\n\n## Apa itu SEO?\nSEO adalah proses mengoptimasi website agar muncul di posisi tinggi hasil pencarian organik (tidak berbayar).\n\n## 1. Riset Kata Kunci\nTemukan kata kunci yang dicari target audiensmu. Gunakan tools seperti Google Keyword Planner atau Ubersuggest.\n\n## 2. Konten Berkualitas\nBuat konten yang menjawab pertanyaan pengguna secara komprehensif. Konten panjang (1500+ kata) cenderung lebih baik.\n\n## 3. On-Page SEO\nOptimasi judul, meta description, URL, dan heading (H1, H2, H3).\n\n## 4. Mobile Friendly\nPastikan website ramah mobile. Google memprioritaskan mobile-first indexing.\n\n## 5. Kecepatan Loading\nWebsite cepat = ranking lebih baik. Target < 3 detik.\n\n## 6. Backlink Berkualitas\nDapatkan link dari situs otoritatif. Kualitas > kuantitas.\n\nSEO adalah maraton, bukan sprint. Konsistensi adalah kunci.`,
      contentEn: `SEO (Search Engine Optimization) is the art and science of making a website appear in Google search results. Here's the basic guide.\n\n## What is SEO?\nSEO is the process of optimizing a website to rank high in organic (unpaid) search results.\n\n## 1. Keyword Research\nFind keywords your target audience searches for. Use tools like Google Keyword Planner or Ubersuggest.\n\n## 2. Quality Content\nCreate content that comprehensively answers user questions. Long content (1500+ words) tends to perform better.\n\n## 3. On-Page SEO\nOptimize title, meta description, URL, and headings (H1, H2, H3).\n\n## 4. Mobile Friendly\nMake sure your website is mobile-friendly. Google prioritizes mobile-first indexing.\n\n## 5. Loading Speed\nFast website = better ranking. Target < 3 seconds.\n\n## 6. Quality Backlinks\nGet links from authoritative sites. Quality > quantity.\n\nSEO is a marathon, not a sprint. Consistency is key.`,
      category: "Digital Marketing",
      tags: "seo,pemula,panduan,google",
      coverImage: "/blog/panduan-seo-untuk-pemula.jpg",
      author: "Budi Santoso",
      featured: true,
      published: true,
    },
    {
      slug: "toko-online-vs-marketplace",
      titleId: "Toko Online vs Marketplace: Mana yang Lebih Untung?",
      titleEn: "Online Store vs Marketplace: Which is More Profitable?",
      excerptId: "Perbandingan lengkap keuntungan dan kerugian punya toko online sendiri vs jual di marketplace.",
      excerptEn: "Complete comparison of the pros and cons of having your own online store vs selling on marketplaces.",
      contentId: `Banyak pelaku bisnis bingung: buat toko online sendiri atau jual di Tokopedia/Shopee? Mari kita bedah.\n\n## Toko Online Sendiri\n**Kelebihan:**\n- Branding penuh\n- Tidak ada biaya komisi\n- Data pelanggan 100% milikmu\n- Bebas aturan marketplace\n\n**Kekurangan:**\n- Perlu upaya marketing lebih\n- Biaya awal pembuatan\n- Perlu maintain sendiri\n\n## Marketplace\n**Kelebihan:**\n- Traffic sudah ada\n- Mulai cepat\n- Sistem pembayaran terpercaya\n\n**Kekurangan:**\n- Komisi per transaksi\n- Persaingan ketat\n- Tidak ada branding\n\n## Solusi Terbaik: Keduanya\nStrategi paling cerdas adalah menggunakan keduanya. Marketplace untuk volume, toko online untuk brand dan loyalitas.`,
      contentEn: `Many business owners wonder: build their own online store or sell on Tokopedia/Shopee? Let's break it down.\n\n## Own Online Store\n**Pros:**\n- Full branding\n- No commission fees\n- 100% customer data ownership\n- Free from marketplace rules\n\n**Cons:**\n- Needs more marketing effort\n- Initial creation cost\n- Self-maintenance needed\n\n## Marketplace\n**Pros:**\n- Existing traffic\n- Quick start\n- Trusted payment system\n\n**Cons:**\n- Per-transaction commission\n- Fierce competition\n- No branding\n\n## Best Solution: Both\nThe smartest strategy is to use both. Marketplace for volume, online store for brand and loyalty.`,
      category: "Bisnis",
      tags: "toko online,marketplace,e-commerce,bisnis",
      coverImage: "/blog/toko-online-vs-marketplace.jpg",
      author: "Maya Anggraini",
      featured: false,
      published: true,
    },
    {
      slug: "tutorial-responsive-design",
      titleId: "Tutorial Responsive Design dengan Tailwind CSS",
      titleEn: "Responsive Design Tutorial with Tailwind CSS",
      excerptId: "Pelajari cara membuat website yang tampil sempurna di semua ukuran layar dengan Tailwind CSS.",
      excerptEn: "Learn how to create a website that looks perfect on all screen sizes with Tailwind CSS.",
      contentId: `Responsive design adalah pendekatan web design yang membuat website tampil optimal di semua perangkat.\n\n## Mengapa Penting?\nLebih dari 60% traffic web kini dari mobile. Google juga menggunakan mobile-first indexing.\n\n## Breakpoint Tailwind\nTailwind menyediakan breakpoint default:\n- sm: 640px\n- md: 768px\n- lg: 1024px\n- xl: 1280px\n\n## Tips Praktis\n1. Gunakan grid dan flexbox\n2. Hindari ukuran fixed, gunakan rem/percent\n3. Test di device asli\n\n## Contoh Kode\n\`\`\`html\n<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">\n  <div>Card 1</div>\n  <div>Card 2</div>\n</div>\n\`\`\`\n\nDengan Tailwind, responsive design menjadi jauh lebih mudah!`,
      contentEn: `Responsive design is a web design approach that makes a website display optimally on all devices.\n\n## Why Important?\nOver 60% of web traffic is now from mobile. Google also uses mobile-first indexing.\n\n## Tailwind Breakpoints\nTailwind provides default breakpoints:\n- sm: 640px\n- md: 768px\n- lg: 1024px\n- xl: 1280px\n\n## Practical Tips\n1. Use grid and flexbox\n2. Avoid fixed sizes, use rem/percent\n3. Test on real devices\n\n## Code Example\n\`\`\`html\n<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">\n  <div>Card 1</div>\n  <div>Card 2</div>\n</div>\n\`\`\`\n\nWith Tailwind, responsive design becomes much easier!`,
      category: "Web Development",
      tags: "tailwind,responsive,css,tutorial",
      coverImage: "/blog/tutorial-responsive-design.jpg",
      author: "Rizki Hidayat",
      featured: false,
      published: true,
    },
  ];
  for (const p of posts) {
    await db.post.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, views: Math.floor(Math.random() * 5000) + 100 },
    });
  }

  const portfolios = [
    {
      slug: "arofahajj",
      titleId: "Arofah Hajj - Portal Haji & Umroh Internasional",
      titleEn: "Arofah Hajj - International Hajj & Umroh Portal",
      descId: "Ekosistem portal haji dan umroh internasional yang mengintegrasikan layanan ibadah haji dan umroh dengan teknologi digital modern. Platform lengkap untuk calon jamaah dengan informasi paket, jadwal, dan panduan ibadah.",
      descEn: "International hajj and umroh portal ecosystem integrating hajj and umroh services with modern digital technology. A complete platform for prospective pilgrims with package info, schedules, and worship guides.",
      category: "Web App",
      client: "Arofah Hajj",
      url: "https://arofahajj.com",
      image: "/portfolio/arofahajj.jpg",
      year: 2024,
      featured: true,
    },
    {
      slug: "kopnusa",
      titleId: "KMN Berdikari - Koperasi Korporasi Multipihak Nusa",
      titleEn: "KMN Berdikari - Multi-Stakeholder Cooperative of Nusa",
      descId: "Portal resmi Koperasi Korporasi Multipihak Nusa Berdikari Merah Putih Indonesia. Mengintegrasikan 83.763 desa, 5 Kelompok Pihak Anggota (KPA), 9 Pilar Kampung, marketplace zonasi, dan logistik untuk kesejahteraan dari desa untuk dunia.",
      descEn: "Official portal of the Multi-Stakeholder Cooperative of Nusa Berdikari Indonesia. Integrating 83,763 villages, 5 Stakeholder Groups, 9 Village Pillars, marketplace zoning, and logistics for welfare from villages to the world.",
      category: "Web App",
      client: "KMN Berdikari",
      url: "https://www.kopnusa.id",
      image: "/portfolio/kopnusa.jpg",
      year: 2024,
      featured: true,
    },
    {
      slug: "nusaparadise",
      titleId: "Nusa Paradise - Portal Wisata Peradaban Terbesar di Dunia",
      titleEn: "Nusa Paradise - Largest Civilization Tourism Portal in the World",
      descId: "Kapal peradaban yang membawa 17.504 pulau, 714 suku bangsa, 1.300 bahasa daerah, dan seluruh kekayaan alam Indonesia berlayar menuju surga dunia yang nyata. Portal wisata terlengkap untuk eksplorasi keindahan Indonesia.",
      descEn: "A civilization ship carrying 17,504 islands, 714 ethnic groups, 1,300 regional languages, and all of Indonesia natural wealth sailing towards a true paradise on earth. The most complete tourism portal for exploring Indonesian beauty.",
      category: "Web App",
      client: "Nusa Paradise",
      url: "https://www.nusaparadise.id",
      image: "/portfolio/nusaparadise.jpg",
      year: 2024,
      featured: true,
    },
    {
      slug: "indonesiaemas2030",
      titleId: "Indonesia Emas 2030 - Platform Percepatan Transformasi",
      titleEn: "Indonesia Emas 2030 - Transformation Acceleration Platform",
      descId: "Roadmap dan platform percepatan Indonesia Emas 2030. Transformasi dari visi 2045 menjadi realitas 2030 melalui digitalisasi, kesehatan gratis, pendidikan gratis, dan pemberdayaan seluruh rakyat Indonesia.",
      descEn: "Roadmap and acceleration platform for Indonesia Emas 2030. Transformation from the 2045 vision into 2030 reality through digitalization, free healthcare, free education, and empowerment of all Indonesian people.",
      category: "Web App",
      client: "Indonesia Emas 2030",
      url: "https://indonesiaemas2030.id",
      image: "/portfolio/indonesiaemas2030.jpg",
      year: 2024,
      featured: true,
    },
    {
      slug: "pusatperizinan",
      titleId: "Pusat Perizinan - Urus Semua Izin Usaha Tinggal Terima Beres",
      titleEn: "Pusat Perizinan - Get All Business Licenses Done Hassle-Free",
      descId: "Konsultan perizinan usaha terbaik Indonesia: NIB 1 hari, pendirian PT 3 hari, sertifikasi halal, izin BPOM/PIRT, PBG & SLF, izin lingkungan, PMA, izin umroh (PPIU) & haji (PPIH), registrasi IATA, dan berbagai izin lainnya.",
      descEn: "Best business licensing consultant in Indonesia: NIB in 1 day, PT establishment in 3 days, halal certification, BPOM/PIRT permits, PBG & SLF, environmental permits, PMA, umroh (PPIU) & hajj (PPIH) permits, IATA registration, and more.",
      category: "Company Profile",
      client: "Pusat Perizinan",
      url: "https://www.pusatperizinan.com",
      image: "/portfolio/pusatperizinan.jpg",
      year: 2024,
      featured: true,
    },
    {
      slug: "mesin-pendingin",
      titleId: "Sentra Indoklima - Pusat Kompresor AC dan Pendingin",
      titleEn: "Sentra Indoklima - AC Compressor and Refrigeration Center",
      descId: "Pusat kompresor AC dan pendingin terlengkap. Menyediakan berbagai mesin pendingin untuk kebutuhan industri, komersial, dan residensial dengan kualitas terjamin dan harga bersaing.",
      descEn: "The most complete AC compressor and refrigeration center. Providing various refrigeration machines for industrial, commercial, and residential needs with guaranteed quality and competitive prices.",
      category: "E-Commerce",
      client: "Sentra Indoklima",
      url: "https://mesin-pendingin.com",
      image: "/portfolio/mesin-pendingin.jpg",
      year: 2023,
      featured: false,
    },
    {
      slug: "tirisglobal",
      titleId: "PT Tiris Global Indonesia - Distributor Kompresor AC dan Freon",
      titleEn: "PT Tiris Global Indonesia - AC Compressor and Freon Distributor",
      descId: "Distributor resmi kompresor AC dan freon terpercaya di Indonesia. Menyediakan produk AC berkualitas dari berbagai brand ternama dengan layanan profesional dan pengiriman ke seluruh Indonesia.",
      descEn: "Trusted official distributor of AC compressors and freon in Indonesia. Providing quality AC products from various well-known brands with professional service and nationwide shipping.",
      category: "Company Profile",
      client: "PT Tiris Global Indonesia",
      url: "https://tirisglobal.com",
      image: "/portfolio/tirisglobal.jpg",
      year: 2024,
      featured: true,
    },
  ];
  for (const p of portfolios) {
    await db.portfolio.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  // Services
  const services = [
    { slug: "website-company-profile", titleId: "Website Company Profile", titleEn: "Company Profile Website", descId: "Website profesional untuk menampilkan profil perusahaan, layanan, dan portofolio bisnis Anda secara online.", descEn: "Professional website to showcase your company profile, services, and business portfolio online.", icon: "Globe", price: 1500000, priceLabel: "Rp 1.500.000", features: "Desain custom modern|Mobile responsive|SEO friendly|Form kontak|Gratis domain .web.id 1 tahun|Hosting gratis 6 bulan", active: true, order: 1 },
    { slug: "toko-online", titleId: "Toko Online / E-Commerce", titleEn: "Online Store / E-Commerce", descId: "Jual produk online dengan sistem keranjang, pembayaran, dan manajemen produk yang mudah.", descEn: "Sell products online with cart system, payment, and easy product management.", icon: "ShoppingCart", price: 3500000, priceLabel: "Rp 3.500.000", features: "Keranjang belanja|Payment gateway|Manajemen stok|Laporan penjualan|Multi kurir|Integrasi WhatsApp", active: true, order: 2 },
    { slug: "aplikasi-web", titleId: "Aplikasi Web Custom", titleEn: "Custom Web Application", descId: "Aplikasi web sesuai kebutuhan bisnis: sistem informasi, dashboard, manajemen, dan lainnya.", descEn: "Web applications tailored to your business: information systems, dashboards, management tools, and more.", icon: "Code", price: 5000000, priceLabel: "Rp 5.000.000", features: "Custom development|Database terstruktur|User management|API integration|Dashboard analitik|Training tim", active: true, order: 3 },
    { slug: "hosting-domain", titleId: "Hosting & Domain", titleEn: "Hosting & Domain", descId: "Hosting cepat andal dan registrasi domain murah untuk website Anda.", descEn: "Fast reliable hosting and affordable domain registration for your website.", icon: "Server", price: 99000, priceLabel: "Rp 99.000/bln", features: "SSD storage|SSL gratis|Email bisnis|cPanel lengkap|Backup harian|Uptime 99.9%", active: true, order: 4 },
    { slug: "seo-marketing", titleId: "SEO & Digital Marketing", titleEn: "SEO & Digital Marketing", descId: "Optimasi mesin pencari dan kampanye digital marketing untuk meningkatkan traffic dan penjualan.", descEn: "Search engine optimization and digital marketing campaigns to boost traffic and sales.", icon: "TrendingUp", price: 1000000, priceLabel: "Rp 1.000.000/bln", features: "Audit SEO|Keyword research|On-page optimization|Google Ads|Meta ads|Laporan bulanan", active: true, order: 5 },
    { slug: "maintenance", titleId: "Maintenance & Support", titleEn: "Maintenance & Support", descId: "Pemeliharaan website berkala, update konten, backup, dan dukungan teknis 24/7.", descEn: "Regular website maintenance, content updates, backup, and 24/7 technical support.", icon: "Wrench", price: 350000, priceLabel: "Rp 350.000/bln", features: "Update konten|Backup berkala|Security monitoring|Performance tuning|Support WhatsApp|Laporan bulanan", active: true, order: 6 },
  ];
  for (const s of services) {
    await db.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    });
  }

  // Testimonials
  const testimonials = [
    { name: "Budi Hartono", company: "Kopi Maju Indonesia", role: "CEO & Founder", messageId: "JuraganWebsite benar-benar mengubah bisnis kopi kami. Penjualan online naik 300% dalam 6 bulan pertama setelah website live. Tim mereka profesional dan responsif.", messageEn: "JuraganWebsite truly transformed our coffee business. Online sales increased 300% in the first 6 months after the website went live. Their team is professional and responsive.", rating: 5, avatar: "BH", active: true, order: 1 },
    { name: "Sarah Kusuma", company: "Bumi Property Group", role: "Marketing Director", messageId: "Website yang dibuat JuraganWebsite sangat elegan dan fungsional. Calon pembeli kini lebih mudah menghubungi kami. Highly recommended!", messageEn: "The website created by JuraganWebsite is very elegant and functional. Potential buyers now find it easier to contact us. Highly recommended!", rating: 5, avatar: "SK", active: true, order: 2 },
    { name: "Dr. Andi Wijaya", company: "Sehat App", role: "Co-Founder", messageId: "Sangat puas dengan layanan JuraganWebsite. Aplikasi telemedicine kami berjalan lancar dan sudah melayani puluhan ribu pasien. Tim teknis selalu siap membantu 24/7.", messageEn: "Very satisfied with JuraganWebsite's service. Our telemedicine app runs smoothly and has served tens of thousands of patients. The technical team is always ready to help 24/7.", rating: 5, avatar: "AW", active: true, order: 3 },
    { name: "Lestari Dewi", company: "Modisa Batik", role: "Owner", messageId: "Dari sekadar toko sosial media, kini kami punya toko online profesional dengan brand sendiri. Terima kasih JuraganWebsite!", messageEn: "From just a social media shop, we now have a professional online store with our own brand. Thank you JuraganWebsite!", rating: 5, avatar: "LD", active: true, order: 4 },
    { name: "Rudianto Tan", company: "Edukasi Raya", role: "Direktur", messageId: "Platform LMS yang dibuat JuraganWebsite membantu kami berkembang pesat. UI/UX-nya ramah pengguna dan stabil.", messageEn: "The LMS platform built by JuraganWebsite helped us grow rapidly. The UI/UX is user-friendly and stable.", rating: 5, avatar: "RT", active: true, order: 5 },
    { name: "Putri Maharani", company: "Nusantara Travel", role: "Marketing Manager", messageId: "Tim JuraganWebsite memahami kebutuhan kami dengan cepat. Website travel kami kini menjadi mesin pencarian pelanggan baru.", messageEn: "JuraganWebsite's team understood our needs quickly. Our travel website is now a customer acquisition machine.", rating: 5, avatar: "PM", active: true, order: 6 },
  ];
  // Clear and recreate testimonials (no unique constraint besides id)
  await db.testimonial.deleteMany({});
  for (const t of testimonials) {
    await db.testimonial.create({ data: t });
  }

  // Sample messages
  const messages = [
    { name: "Joko Susilo", email: "joko@gmail.com", phone: "08123456789", subject: "Tanya pembuatan toko online", message: "Halo, saya tertarik membuat toko online untuk produk fashion. Bisa info detail harga dan prosesnya?", status: "new", read: false, replied: false },
    { name: "Maya Sari", email: "maya@business.co.id", phone: "08987654321", subject: "Konsultasi website company profile", message: "Selamat siang, saya butuh website untuk perusahaan konsultan kami. Bisa dijadwalkan meeting untuk diskusi?", status: "new", read: false, replied: false },
    { name: "Andi Pratama", email: "andi@gmail.com", phone: "08111223344", subject: "Maintenance website", message: "Saya punya website lama yang perlu di-maintenance dan diupdate. Apakah ada layanan ini?", status: "read", read: true, replied: false },
  ];
  for (const m of messages) {
    await db.message.create({ data: m }).catch(() => {});
  }

  console.log("✅ Seeding complete!");
  console.log("   Admin: username=admin password=juragan2007");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
