import React, { ReactNode } from "react";
import { HashRouter } from "react-router-dom";
import KeycloakAdminClient from "keycloak-admin";

import { AccessContextProvider } from "../context/access/Access";
import { WhoAmIContextProvider } from "../context/whoami/WhoAmI";
import { RealmContext } from "../context/realm-context/RealmContext";
import { AdminClient } from "../context/auth/AdminClient";
import { ServerInfoContext } from "../context/server-info/ServerInfoProvider";

import whoamiMock from "../context/whoami/__tests__/mock-whoami.json";
import serverInfo from "../context/server-info/__tests__/mock.json";

/**
 * This component provides some mocked default react context so that other components can work in a storybook.
 * In it's simplest form wrap your component like so:
 * @example
 *  <MockAdminClient>
 *    <SomeComponent />
 *  </MockAdminClient>
 * @example <caption>With an endpoint, roles => findOneById</caption>
 *   <MockAdminClient mock={{ roles: { findOneById: () => mockJson } }}>
 *     <<SomeComponent />
 *   </MockAdminClient>
 * @param props mock endpoints to be mocked
 */
export const MockAdminClient = (props: {
  children: ReactNode;
  mock?: object;
}) => {
  return (
    <HashRouter>
      <ServerInfoContext.Provider value={serverInfo}>
        <AdminClient.Provider
          value={
            ({
              ...props.mock,
              keycloak: {},
              whoAmI: { find: () => Promise.resolve(whoamiMock) },
              setConfig: () => {},
            } as unknown) as KeycloakAdminClient
          }
        >
          <WhoAmIContextProvider>
            <RealmContext.Provider
              value={{ realm: "master", setRealm: () => {} }}
            >
              <AccessContextProvider>{props.children}</AccessContextProvider>
            </RealmContext.Provider>
          </WhoAmIContextProvider>
        </AdminClient.Provider>
      </ServerInfoContext.Provider>
    </HashRouter>
  );
};
