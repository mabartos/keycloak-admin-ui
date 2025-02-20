import React, { useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { AlertVariant, Button, ButtonVariant } from "@patternfly/react-core";
import { wrappable } from "@patternfly/react-table";

import ClientInitialAccessPresentation from "keycloak-admin/lib/defs/clientInitialAccessPresentation";
import { KeycloakDataTable } from "../../components/table-toolbar/KeycloakDataTable";
import { useAdminClient } from "../../context/auth/AdminClient";
import { useRealm } from "../../context/realm-context/RealmContext";
import { ListEmptyState } from "../../components/list-empty-state/ListEmptyState";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { useAlerts } from "../../components/alert/Alerts";

export const InitialAccessTokenList = () => {
  const { t } = useTranslation("clients");

  const adminClient = useAdminClient();
  const { addAlert } = useAlerts();
  const { realm } = useRealm();

  const history = useHistory();
  const { url } = useRouteMatch();

  const [token, setToken] = useState<ClientInitialAccessPresentation>();

  const loader = async () =>
    await adminClient.realms.getClientsInitialAccess({ realm });

  const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
    titleKey: "clients:tokenDeleteConfirmTitle",
    messageKey: t("tokenDeleteConfirm", token),
    continueButtonLabel: "common:delete",
    continueButtonVariant: ButtonVariant.danger,
    onConfirm: async () => {
      try {
        await adminClient.realms.delClientsInitialAccess({
          realm,
          id: token!.id!,
        });
        addAlert(t("tokenDeleteSuccess"), AlertVariant.success);
        setToken(undefined);
      } catch (error) {
        addAlert(t("tokenDeleteError", { error }), AlertVariant.danger);
      }
    },
  });

  return (
    <>
      <DeleteConfirm />
      <KeycloakDataTable
        key={token?.id}
        ariaLabelKey="clients:initialAccessToken"
        searchPlaceholderKey="clients:searchInitialAccessToken"
        loader={loader}
        toolbarItem={
          <>
            <Button onClick={() => history.push(`${url}/create`)}>
              {t("common:create")}
            </Button>
          </>
        }
        actions={[
          {
            title: t("common:delete"),
            onRowClick: (token) => {
              setToken(token);
              toggleDeleteDialog();
            },
          },
        ]}
        columns={[
          {
            name: "id",
            displayKey: "common:id",
          },
          {
            name: "timestamp",
            displayKey: "clients:timestamp",
            cellRenderer: (row) => moment(row.timestamp! * 1000).format("LLL"),
          },
          {
            name: "expiration",
            displayKey: "clients:expires",
            cellRenderer: (row) =>
              moment(row.timestamp! * 1000 + row.expiration! * 1000).format(
                "LLL"
              ),
          },
          {
            name: "count",
            displayKey: "clients:count",
          },
          {
            name: "remainingCount",
            displayKey: "clients:remainingCount",
            transforms: [wrappable],
          },
        ]}
        emptyState={
          <ListEmptyState
            message={t("noTokens")}
            instructions={t("noTokensInstructions")}
            primaryActionText={t("common:create")}
            onPrimaryAction={() => history.push(`${url}/create`)}
          />
        }
      />
    </>
  );
};
