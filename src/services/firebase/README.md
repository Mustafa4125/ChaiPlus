Firebase geçişi için hazır altyapı:

- src/services/firebase/config.ts: çevre değişkenleri ve yapılandırma kontrolü
- src/services/dataSource.ts: mock / firebase kaynak seçim katmanı
- src/repositories: veri erişim soyutlaması
- src/services/appDataService.ts: UI katmanının veri çağrılarını yöneten servis katmanı

Gelecekte eklenebilecek adımlar:

1. Firebase SDK paketlerini kur.
2. Firebase repository implementation sınıfı yaz.
3. appDataService.setRepository(...) ile geçiş yap.
