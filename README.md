# Letterboxd Selenium Test Suite

Automatski testovi za Letterboxd web aplikaciju korištenjem Selenium WebDriver-a.

## Instalacija

```bash
npm install
```

## Pokretanje testova

```bash
# Pokretanje svih testova
npx mocha tests/*.test.js

# Pokretanje pojedinačnog testa
npx mocha tests/TC-WL-007.test.js
```

## Poznati problemi sa Letterboxd u automatiziranom testnom riješenju

### ⚠️ Transient Login Issue

Povremeno se može desiti da test padne u `before all` hook-u sa greškom:

```
NoSuchElementError: no such element: Unable to locate element: {"method":"css selector","selector":"input[type=\"submit\"]"}
```

ili:

```
NoSuchSessionError: invalid session id
NoSuchWindowError: no such window: target window already closed
```

**Uzrok:** Ovo je prolazni problem kod kojeg se prilikom otvaranja sign-in stranice polja za prijavu jednostavno ne učitaju.

**Rješenje:** Jednostavno ponovo pokrenite test. Problem se obično ne ponavlja pri ponovnom pokretanju.

```bash
# Ako test padne, pokušajte ponovo
npx mocha tests/TC-WL-007.test.js
```

## Struktura projekta

```
├── tests/
│   ├── setup.js              # Konfiguracija WebDriver-a i login helper
│   ├── helpers/
│   │   └── test-helper.js    # Pomoćne funkcije za testove
│   ├── TC-WL-001.test.js     # Test case 1
│   ├── TC-WL-002.test.js     # Test case 2
│   └── ...
├── package.json
└── README.md
```

## Zahtjevi

- Node.js
- Chrome browser
- ChromeDriver (automatski se preuzima putem selenium-webdriver)
