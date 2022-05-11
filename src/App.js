import './App.css';
import { CeramicClient } from '@ceramicnetwork/http-client'
import { DID } from 'dids'
import { getResolver as getKeyResolver } from 'key-did-resolver'
import { getResolver as get3IDResolver } from '@ceramicnetwork/3id-did-resolver'
import { ThreeIdProvider } from '@3id/did-provider'

function getPermission(request) {
  return Promise.resolve(request.payload.paths)
}

// `authSecret` must be a 32-byte long Uint8Array
async function authenticateWithSecret(authSecret) {
  // const API_URL = 'http:///localhost:7007';
  // const ceramic = new CeramicClient(API_URL);
  const ceramic = new CeramicClient();
  
  const threeID = await ThreeIdProvider.create({
    authId: 'myAuthID',
    authSecret,
    // See the section above about permissions management
    getPermission: (request) => Promise.resolve(request.payload.paths),
  })

  const did = new DID({
    provider: threeID.getDidProvider(),
    resolver: {
      ...get3IDResolver(ceramic),
      ...getKeyResolver(),
    },
  })

  // Authenticate the DID using the 3ID provider
  await did.authenticate()

  // The Ceramic client can create and update streams using the authenticated DID
  ceramic.did = did
  console.log("did = " + ceramic.did);

  return ceramic.did;
}

function App() {
  // `authSecret` must be a 32-byte long Uint8Array
  const authSecret = new Uint8Array(32);
  crypto.getRandomValues(authSecret);

  (async() => {
    let did = await authenticateWithSecret(authSecret);
    console.log("did = " + did.id);
  })();

  return (
    <div className="App">
      <header className="App-header">
        <p>
          3 ID Provider with Auth and Secret
        </p>
      </header>
    </div>
  );
}

export default App;
