# Workcycle API
API for backend 

## 1. Install dependencies
Run the following command:
```
  npm install
```



## 2. Configure database connection settings
Db connections are pre-configured (for PRODUCTION and DEVELOPMENT NODE_ENVs). If you feel the need to add more, feel free

## 3. Linting
Uses eslint. Expects it global. 

To install dependencies: 
```
npm install -g eslint eslint-plugin-promise eslint-plugin-node eslint-plugin-standard
```

To check linting:
```
npm run lint -s
```
The flag _-s_ suppresses the npm error output if there's linting issues.

### 2.1 Use the `config.js` file

### 2.2 Use environment variables

You can overwrite the options in the `config` file by using environment variables: 
```
  export NODE_ENV=PRODUCTION PORT=6654
```

