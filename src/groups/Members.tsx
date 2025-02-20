import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import {
  AlertVariant,
  Button,
  Checkbox,
  Dropdown,
  DropdownItem,
  KebabToggle,
  ToolbarItem,
} from "@patternfly/react-core";

import GroupRepresentation from "keycloak-admin/lib/defs/groupRepresentation";
import UserRepresentation from "keycloak-admin/lib/defs/userRepresentation";
import { KeycloakDataTable } from "../components/table-toolbar/KeycloakDataTable";
import { useAdminClient } from "../context/auth/AdminClient";
import { useAlerts } from "../components/alert/Alerts";
import { emptyFormatter } from "../util";

import { getLastId } from "./groupIdUtils";
import { useSubGroups } from "./SubGroupsContext";
import { MemberModal } from "./MembersModal";
import { ListEmptyState } from "../components/list-empty-state/ListEmptyState";

type MembersOf = UserRepresentation & {
  membership: GroupRepresentation[];
};

export const Members = () => {
  const { t } = useTranslation("groups");
  const adminClient = useAdminClient();
  const { addAlert } = useAlerts();
  const location = useLocation();
  const id = getLastId(location.pathname);
  const [includeSubGroup, setIncludeSubGroup] = useState(false);
  const { currentGroup, subGroups } = useSubGroups();
  const [addMembers, setAddMembers] = useState(false);
  const [isKebabOpen, setIsKebabOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<UserRepresentation[]>([]);

  const [key, setKey] = useState(0);
  const refresh = () => setKey(new Date().getTime());

  useEffect(() => {
    refresh();
  }, [id, subGroups, includeSubGroup]);

  const getMembership = async (id: string) =>
    await adminClient.users.listGroups({ id: id! });

  const getSubGroups = (groups: GroupRepresentation[]) => {
    let subGroups: GroupRepresentation[] = [];
    for (const group of groups!) {
      subGroups.push(group);
      const subs = getSubGroups(group.subGroups!);
      subGroups = subGroups.concat(subs);
    }
    return subGroups;
  };

  const loader = async (first?: number, max?: number) => {
    let members = await adminClient.groups.listMembers({
      id: id!,
      first,
      max,
    });

    if (includeSubGroup) {
      const subGroups = getSubGroups(currentGroup().subGroups!);
      for (const group of subGroups) {
        members = members.concat(
          await adminClient.groups.listMembers({ id: group.id! })
        );
      }
      members = _.uniqBy(members, (member) => member.username);
    }

    const memberOfPromises = await Promise.all(
      members.map((member) => getMembership(member.id!))
    );
    return members.map((member: UserRepresentation, i) => {
      return { ...member, membership: memberOfPromises[i] };
    });
  };

  const MemberOfRenderer = (member: MembersOf) => {
    return (
      <>
        {member.membership.map((group) => (
          <>{group.path} </>
        ))}
      </>
    );
  };

  return (
    <>
      {addMembers && (
        <MemberModal
          groupId={id!}
          onClose={() => {
            setAddMembers(false);
            refresh();
          }}
        />
      )}
      <KeycloakDataTable
        key={key}
        loader={loader}
        ariaLabelKey="groups:members"
        isPaginated
        canSelectAll
        onSelect={(rows) => setSelectedRows([...rows])}
        toolbarItem={
          <>
            <ToolbarItem>
              <Button
                data-testid="addMember"
                variant="primary"
                onClick={() => setAddMembers(true)}
              >
                {t("addMember")}
              </Button>
            </ToolbarItem>
            <ToolbarItem>
              <Checkbox
                data-testid="includeSubGroupsCheck"
                label={t("includeSubGroups")}
                id="kc-include-sub-groups"
                isChecked={includeSubGroup}
                onChange={() => setIncludeSubGroup(!includeSubGroup)}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Dropdown
                toggle={
                  <KebabToggle onToggle={() => setIsKebabOpen(!isKebabOpen)} />
                }
                isOpen={isKebabOpen}
                isPlain
                dropdownItems={[
                  <DropdownItem
                    key="action"
                    component="button"
                    onClick={async () => {
                      try {
                        await Promise.all(
                          selectedRows.map((user) =>
                            adminClient.users.delFromGroup({
                              id: user.id!,
                              groupId: id!,
                            })
                          )
                        );
                        setIsKebabOpen(false);
                        addAlert(
                          t("usersLeft", { count: selectedRows.length }),
                          AlertVariant.success
                        );
                      } catch (error) {
                        addAlert(t("usersLeftError"), AlertVariant.danger);
                      }

                      refresh();
                    }}
                  >
                    {t("leave")}
                  </DropdownItem>,
                ]}
              />
            </ToolbarItem>
          </>
        }
        columns={[
          {
            name: "username",
            displayKey: "common:name",
          },
          {
            name: "email",
            displayKey: "groups:email",
            cellFormatters: [emptyFormatter()],
          },
          {
            name: "firstName",
            displayKey: "groups:firstName",
            cellFormatters: [emptyFormatter()],
          },
          {
            name: "lastName",
            displayKey: "groups:lastName",
            cellFormatters: [emptyFormatter()],
          },
          {
            name: "membership",
            displayKey: "groups:membership",
            cellRenderer: MemberOfRenderer,
          },
        ]}
        emptyState={
          <ListEmptyState
            message={t("users:noUsersFound")}
            instructions={t("users:emptyInstructions")}
            primaryActionText={t("addMember")}
            onPrimaryAction={() => setAddMembers(true)}
          />
        }
      />
    </>
  );
};
