import React, {useState, useEffect, useRef} from "react";
import {CeramicClient} from '@ceramicnetwork/http-client'
import {DID} from 'dids'
import {getResolver as getKeyResolver} from 'key-did-resolver'
import {getResolver as get3IDResolver} from '@ceramicnetwork/3id-did-resolver'
import {ThreeIdProvider} from '@3id/did-provider'

export default function App() {
    // modeled after
    // https://dev.to/alexandrudanpop/correctly-handling-async-await-in-react-components-4h74

    const [did, setDid] = useState(null);
    const [count, setCount] = useState(0);
    const componentIsMounted = useRef(true);

    useEffect(() => {
        // each useEffect can return a cleanup function
        return () => {
            componentIsMounted.current = false;
        };
    }, []); // no extra deps => the cleanup function runs this on component unmount

    useEffect(() => {
        async function authenticateWithSecret() {
            try {
                // `authSecret` must be a 32-byte long Uint8Array
                const authSecret = new Uint8Array(32);
                crypto.getRandomValues(authSecret);
                const authId = 'myAuthId';

                const API_URL = 'http:///localhost:7007';
                const ceramic = new CeramicClient(API_URL);

                const threeID = await ThreeIdProvider.create({
                    ceramic: ceramic,
                    authId: authId,
                    authSecret,
                    // This grants all permissions
                    // See https://developers.ceramic.network/reference/accounts/3id-did/
                    getPermission: (request) => Promise.resolve(request.payload.paths),
                })

                const did = new DID({
                    provider: threeID.getDidProvider(),
                    resolver: {
                        ...get3IDResolver(ceramic),
                        ...getKeyResolver(),
                    },
                })

                // Authenticate the DID, using the 3ID provider
                await did.authenticate()

                // The Ceramic client can create and update streams using the authenticated DID
                ceramic.did = did

                // if (componentIsMounted.current) {
                    setDid(did);
                // }
            } catch (err) {
                console.error(err);
            }

            console.log("did = " + did._id);
        }

        authenticateWithSecret();
    }, [count]);

    return (
        <div>
            { did && <h2>{did.id}</h2> }

            <button onClick={() => setCount(count+1)}>Authenticate</button>
        </div>
    );
}
// `"${ceramic.did}"`