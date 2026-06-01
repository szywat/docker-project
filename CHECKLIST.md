# CHECKLIST - Projekt Kubernetes & CI/CD

[**Link do ostatniego udanego workflow GitHub Actions:**](https://github.com/szywat/docker-project/commit/f13aaa333f9c1436df3c6484413f4ef7494e88bf)

---

## 1. Instrukcja uruchomienia (lokalnie)

Projekt jest przystosowany do uruchomienia na lokalnym klastrze wbudowanym w **Docker Desktop** (lub Minikube / KinD) z zainstalowanym kontrolerem Ingress (NGINX).

**Kroki wdrożenia:**

1. Klonowanie repozytorium i przejście do głównego katalogu projektu.
2. Zbudowanie lokalnych obrazów Dockera (aby zapobiec pobieraniu obrazów chmurowych zdefiniowanych dla CI/CD, użyto `imagePullPolicy: IfNotPresent`):
   ```bash
   docker build -t proj-kub-backend:v1 ./backend
   docker build -t proj-kub-frontend:v1 ./frontend
   ```
3. Aplikacja manifestów w odpowiedniej kolejności:

   ```bash
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/config/
   kubectl apply -f k8s/postgres/
   kubectl apply -f k8s/redis/
   kubectl apply -f k8s/backend/
   kubectl apply -f k8s/frontend/
   kubectl apply -f k8s/ingress/
   ```

## 2. Lista zaimplementowanych zasobów Kubernetes

Wszystkie zasoby znajdują się w dedykowanym namespace `taskmanager`

- **Namespace**: `taskmanager`
- **Deploymeny**: `backend` (2 repliki, Rolling Update), `frontend` (1 replika), `redis` (1 replika)
- **StatefulSet**: `postgres` (1 replika, gwarantująca tożsamość instancji)
- **PersistentVolumeClaim (PVC)**: Zdefiniowane dynamicznie przez `volumeClaimTemplates` wewnątrz StatefulSet.
- **Service**: `postgres`, `redis`, `backend`, `frontend` (wszystkie typu ClusterIP, ukryte wewnątrz klastra).
- **Ingres** `app-ingres` z routingiem ruch na ścieżki `/api` (Backend) oraz `/` (Frontend).
- **ConfigMap & Secret**: `app-config` oraz `app-secret` oddzielające konfigurację jawną od poufnej.

## 3. Zrealizowane wymogi punktowe

- [x] Backend ma **minimum 2 repliki** i strategię aktualizacji (Rolling Update).
- [x] Baza danych działa jako **Statefulset** i używa **PVC**.
- [x] Baza danych i cache **NIE są wystawione na zewnatrz** (korzystają z ClusterIP).
- [x] Kontenery posiadają **readinessProbe** oraz **livenessProbe** testujące m.in. endpoint `/health`.
- [x] KOntenery posiadają **resources.requests** oraz **resources.limits**.
- [x] Główny kontener uruchamia się z obniżonymi uprawnieniami za pomocą **securityContext (runAsNonRoot: true, runAsUser:1000)**.
- [x] Backend zawiera **initContainer**, który oczekuje na pełną gotowość bazy POstgreSQL.
- [x] **Zautomatyzowany Pipeline CI/CD**: Workflow Github Actions buduje obrazy, publikuje je na GHCR, uruchamia wirtualny klaster KinD, wdraża manifesty z użyciem `kubectl set image`, testuje Rollout oraz sprawdza status komendą curl.
- [x] Dodano adnotacje Prometheusa (`prometheus.io/scrape`) wystawiające endpoint `/metrics` na backendzie.

## 4. Komendy testowe i przykładowe wyniki

Po uruchomieniu aplikacji i odczekaniu na status `Running` wszystkich podów, aplikacja jest dostępna pod adresem `http://localhost`.

### A. Sprawdzenie statusu klastra

```bash
# Weryfikacja działania podów
kubectl get pods -n taskmanager

# Oczekiwany wynik:
# NAME                        READY   STATUS    RESTARTS   AGE
# backend-78f9...-x1a2b       1/1     Running   0          2m
# backend-78f9...-y3c4d       1/1     Running   0          2m
# frontend-6b8c...-z5e6f      1/1     Running   0          2m
# postgres-0                  1/1     Running   0          2m
# redis-9d1a...-w7h8i         1/1     Running   0          2m

# Sprawdzenie poprawnego Rolloutu dla backendu
kubectl rollout status deployment/backend -n taskmanager
# Oczekiwany wynik: deployment "backend" successfully rolled out
```

### B. Testy biznesowe i Healthchecki (z zewnątrz przez Ingress)

**Dodanie nowego zadania (POST)**:

```bash
curl -X POST http://localhost/api/tasks \
-H "Content-Type: application/json" \
-d '{"title":"Przetestować projekt K8s"}'

# Oczekiwany wynik:
# {"id":1,"title":"Przetestować projekt K8s","done":false,"created_at":"2026-06-01T02:19:24.425Z"}
```

**Pobranie zadań (GET)**:

```bash
curl http://localhost/api/tasks

# Oczekiwany wynik:
# [{"id":1,"title":"Przetestować projekt K8s","done":false,"created_at":"2026-06-01T02:19:24.425Z"}]
```

**Test endpointu Healthcheck**:

```bash
curl --fail http://localhost/health

# Oczekiwany wynik:
# {"status":"ok"}
```
