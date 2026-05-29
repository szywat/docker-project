# Wymagania projektowe

### Wymagania architektoniczne — Kubernetes i CI/CD (32 pkt)

- **(4.8 pkt)** Projekt zawiera katalog **k8s/** albo **Helm/Kustomize**. Manifesty obejmują minimum:
  - **Namespace**,
  - **Deployment**,
  - **StatefulSet** (lub równoważny zasób dla bazy),
  - **Service**,
  - **Ingress**,
  - **ConfigMap**,
  - **Secret**,
  - **PVC**.
- **(4 pkt)** Frontend/API/worker działają jako **Deployment**. Backend ma minimum **2 repliki** i strategię aktualizacji rolling update.  
   Sprawdzenie:
  - `kubectl get deploy`,
  - `kubectl rollout status`.
- **(4.8 pkt)** Baza danych działa jako **StatefulSet** albo przez jasno uzasadniony zasób zapewniający trwałość. **Musi** używać **PersistentVolumeClaim**.
- **(4 pkt)** Komunikacja wewnętrzna odbywa się przez **Service**. Ruch zewnętrzny przechodzi przez **Ingress**.  
  Baza danych, cache i worker **nie są** wystawione na zewnątrz klastra.
- **(3.2 pkt)** Konfiguracja niepoufna jest w **ConfigMap**, a dane poufne w **Secret**. Hasła i tokeny **nie mogą** być zapisane jawnie w kodzie aplikacji ani w _README_ jako prawdziwe wartości produkcyjne.
- **(4 pkt)** Główne kontenery mają **readinessProbe** i **livenessProbe** oraz ustawione **resources.requests** i **resources.limits**.  
  Sprawdzenie:
  - szybka analiza manifestów,
  - `kubectl describe pod`.
- **(3.2 pkt)** Kontenery aplikacyjne działają jako **_non-root_** i mają podstawowy **securityContext**.  
  Projekt używa:
  - **initContainer** albo **Job** do migracji bazy,
  - inicjalizacji danych lub oczekiwania na zależności.
- **(4 pkt)** Repozytorium zawiera workflow, który:
  - buduje obraz,
  - uruchamia testy lub podstawową walidację,
  - publikuje obraz do rejestru,
  - wykonuje deploy przez `kubectl`, Helm albo Kustomize.
  - Workflow sprawdza rollout po wdrożeniu.

---

### Rzeczy dodatkowe spoza zajęć (+4 pkt)

- **(1 pkt)** Projekt definiuje **NetworkPolicy**, które ograniczają ruch między podami, np. baza przyjmuje ruch tylko z backendu lub workera.
- **(1 pkt)** Dla backendu dodano **PodDisruptionBudget**, który chroni minimalną dostępność replik podczas aktualizacji lub prac utrzymaniowych klastra.
- **(1 pkt)** Projekt używa **Helm** albo **Kustomize** do parametryzacji manifestów i obsługuje **minimum** dwa środowiska, np. _dev_ i _prod_.
- **(1 pkt)** Aplikacja udostępnia **_/metrics_**, adnotacje dla **Prometheusa** albo inną prostą formę obserwowalności oraz instrukcję sprawdzenia metryk/logów.

---

### Wymagania specyficzne dla tego projektu (8 pkt)

- **(4 pkt)** Aplikacja ma **jeden** główny zasób biznesowy i obsługuje **co najmniej**:
  - dodanie danych,
  - odczyt danych,
  - endpoint **_/health_** lub **_/ready_**.  
    Sprawdzenie:
    - 2-3 komendy **curl** po wdrożeniu.
- **(2 pkt)** Dane aplikacji są zapisywane w bazie danych działającej w Kubernetes i pozostają dostępne po restarcie poda bazy.  
  Sprawdzenie:
  - dodać rekord,
  - usunąć pod bazy,
  - odczytać rekord po odtworzeniu poda.
- **(2 pkt)** Projekt zawiera dodatkowy komponent architektury, np. **Redis**, **RabbitMQ** albo worker. **Musi** być prosty dowód działania w **_CHECKLIST.md_**.
