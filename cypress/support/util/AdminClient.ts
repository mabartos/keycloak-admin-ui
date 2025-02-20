import KeycloakAdminClient from "keycloak-admin";
import UserRepresentation from "keycloak-admin/lib/defs/userRepresentation";
import ClientRepresentation from "keycloak-admin/lib/defs/clientRepresentation";

export default class AdminClient {
  private client: KeycloakAdminClient;
  constructor() {
    this.client = new KeycloakAdminClient({
      baseUrl: "http://localhost:8180/auth",
      realmName: "master",
    });
  }

  private async login() {
    await this.client.auth({
      username: "admin",
      password: "admin",
      grantType: "password",
      clientId: "admin-cli",
    });
  }

  async deleteRealm(realm: string) {
    await this.login();
    await this.client.realms.del({ realm });
  }

  async createClient(client: ClientRepresentation) {
    await this.login();
    await this.client.clients.create(client);
  }
  async deleteClient(clientName: string) {
    await this.login();
    const client = (
      await this.client.clients.find({ clientId: clientName })
    )[0];
    await this.client.clients.del({ id: client.id! });
  }

  async createSubGroups(groups: string[]) {
    await this.login();
    let parentGroup = undefined;
    const createdGroups = [];
    for (const group of groups) {
      if (!parentGroup) {
        parentGroup = await this.client.groups.create({ name: group });
      } else {
        parentGroup = await this.client.groups.setOrCreateChild(
          { id: parentGroup.id },
          { name: group }
        );
      }
      createdGroups.push(parentGroup);
    }
    return createdGroups;
  }

  async deleteGroups() {
    await this.login();
    const groups = await this.client.groups.find();
    for (const group of groups) {
      await this.client.groups.del({ id: group.id! });
    }
  }

  async createUser(user: UserRepresentation) {
    await this.login();
    return await this.client.users.create(user);
  }

  async createUserInGroup(username: string, groupId: string) {
    await this.login();
    const user = await this.createUser({ username, enabled: true });
    await this.client.users.addToGroup({ id: user.id!, groupId });
  }
}
