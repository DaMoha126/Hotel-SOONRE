# Hôtel Soonré

Application de gestion hôtelière en français.

Les pages `index.html` et `hotelsoonre.html` utilisent le même `app.js`. Les dépendances du navigateur sont figées dans `vendor/`.

## Tests locaux

Node.js 20 ou ultérieur :

```sh
npm ci
npm test
```

La suite utilise des données fictives et des services simulés. Elle ne contacte pas de service en production.

Les tests de services serveur sont conservés séparément et ne sont pas inclus dans ce dépôt.

Les fichiers de schéma privés, les données métier et les fichiers d’environnement sont exclus du dépôt.
