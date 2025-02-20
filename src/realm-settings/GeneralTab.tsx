import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { useErrorHandler } from "react-error-boundary";
import {
  ActionGroup,
  AlertVariant,
  Button,
  ClipboardCopy,
  FormGroup,
  PageSection,
  Select,
  SelectOption,
  SelectVariant,
  Stack,
  StackItem,
  Switch,
  TextInput,
} from "@patternfly/react-core";

import RealmRepresentation from "keycloak-admin/lib/defs/realmRepresentation";
import { getBaseUrl } from "../util";
import { useAdminClient, asyncStateFetch } from "../context/auth/AdminClient";
import { useRealm } from "../context/realm-context/RealmContext";
import { useAlerts } from "../components/alert/Alerts";
import { FormAccess } from "../components/form-access/FormAccess";
import { HelpItem } from "../components/help-enabler/HelpItem";
import { FormattedLink } from "../components/external-link/FormattedLink";

export const RealmSettingsGeneralTab = () => {
  const { t } = useTranslation("realm-settings");
  const adminClient = useAdminClient();
  const handleError = useErrorHandler();
  const { realm: realmName } = useRealm();
  const { addAlert } = useAlerts();
  const { register, control, setValue, handleSubmit } = useForm();
  const [realm, setRealm] = useState<RealmRepresentation>();
  const [open, setOpen] = useState(false);

  const baseUrl = getBaseUrl(adminClient);

  const requireSslTypes = ["all", "external", "none"];

  useEffect(() => {
    return asyncStateFetch(
      () => adminClient.realms.findOne({ realm: realmName }),
      (realm) => {
        setRealm(realm);
        setupForm(realm);
      },
      handleError
    );
  }, []);

  const setupForm = (realm: RealmRepresentation) => {
    Object.entries(realm).map((entry) => setValue(entry[0], entry[1]));
  };

  const save = async (realm: RealmRepresentation) => {
    try {
      await adminClient.realms.update({ realm: realmName }, realm);
      setRealm(realm);
      addAlert(t("saveSuccess"), AlertVariant.success);
    } catch (error) {
      addAlert(t("saveError", { error }), AlertVariant.danger);
    }
  };

  return (
    <>
      <PageSection variant="light">
        <FormAccess
          isHorizontal
          role="manage-realm"
          className="pf-u-mt-lg"
          onSubmit={handleSubmit(save)}
        >
          <FormGroup label={t("realmId")} fieldId="kc-realm-id" isRequired>
            <ClipboardCopy isReadOnly>{realmName}</ClipboardCopy>
          </FormGroup>
          <FormGroup label={t("displayName")} fieldId="kc-display-name">
            <TextInput
              type="text"
              id="kc-display-name"
              name="displayName"
              ref={register}
            />
          </FormGroup>
          <FormGroup
            label={t("htmlDisplayName")}
            fieldId="kc-html-display-name"
          >
            <TextInput
              type="text"
              id="kc-html-display-name"
              name="displayNameHtml"
              ref={register}
            />
          </FormGroup>
          <FormGroup
            label={t("frontendUrl")}
            fieldId="kc-frontend-url"
            labelIcon={
              <HelpItem
                helpText="realm-settings-help:frontendUrl"
                forLabel={t("frontendUrl")}
                forID="kc-frontend-url"
              />
            }
          >
            <TextInput
              type="text"
              id="kc-frontend-url"
              name="attributes.frontendUrl"
              ref={register}
            />
          </FormGroup>
          <FormGroup
            label={t("requireSsl")}
            fieldId="kc-require-ssl"
            labelIcon={
              <HelpItem
                helpText="realm-settings-help:requireSsl"
                forLabel={t("requireSsl")}
                forID="kc-require-ssl"
              />
            }
          >
            <Controller
              name="sslRequired"
              defaultValue="none"
              control={control}
              render={({ onChange, value }) => (
                <Select
                  toggleId="kc-require-ssl"
                  onToggle={() => setOpen(!open)}
                  onSelect={(_, value) => {
                    onChange(value as string);
                    setOpen(false);
                  }}
                  selections={value}
                  variant={SelectVariant.single}
                  aria-label={t("requireSsl")}
                  isOpen={open}
                >
                  {requireSslTypes.map((sslType) => (
                    <SelectOption
                      selected={sslType === value}
                      key={sslType}
                      value={sslType}
                    >
                      {t(`sslType.${sslType}`)}
                    </SelectOption>
                  ))}
                </Select>
              )}
            />
          </FormGroup>
          <FormGroup
            hasNoPaddingTop
            label={t("userManagedAccess")}
            labelIcon={
              <HelpItem
                helpText="realm-settings-help:userManagedAccess"
                forLabel={t("userManagedAccess")}
                forID="kc-user-manged-access"
              />
            }
            fieldId="kc-user-manged-access"
          >
            <Controller
              name="userManagedAccessAllowed"
              control={control}
              defaultValue={false}
              render={({ onChange, value }) => (
                <Switch
                  id="kc-user-managed-access"
                  data-testid="user-managed-access-switch"
                  label={t("common:on")}
                  labelOff={t("common:off")}
                  isChecked={value}
                  onChange={onChange}
                />
              )}
            />
          </FormGroup>
          <FormGroup
            label={t("endpoints")}
            labelIcon={
              <HelpItem
                helpText="realm-settings-help:endpoints"
                forLabel={t("endpoints")}
                forID="kc-endpoints"
              />
            }
            fieldId="kc-endpoints"
          >
            <Stack>
              <StackItem>
                <FormattedLink
                  href={`${baseUrl}realms/${realmName}/.well-known/openid-configuration`}
                  title={t("openEndpointConfiguration")}
                />
              </StackItem>
              <StackItem>
                <FormattedLink
                  href={`${baseUrl}realms/${realmName}/protocol/saml/descriptor`}
                  title={t("samlIdentityProviderMetadata")}
                />
              </StackItem>
            </Stack>
          </FormGroup>

          <ActionGroup>
            <Button
              variant="primary"
              type="submit"
              data-testid="general-tab-save"
            >
              {t("common:save")}
            </Button>
            <Button variant="link" onClick={() => setupForm(realm!)}>
              {t("common:revert")}
            </Button>
          </ActionGroup>
        </FormAccess>
      </PageSection>
    </>
  );
};
