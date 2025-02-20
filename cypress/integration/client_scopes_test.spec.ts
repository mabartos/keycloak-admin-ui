import LoginPage from "../support/pages/LoginPage";
import Masthead from "../support/pages/admin_console/Masthead";
import ListingPage from "../support/pages/admin_console/ListingPage";
import SidebarPage from "../support/pages/admin_console/SidebarPage";
import CreateClientScopePage from "../support/pages/admin_console/manage/client_scopes/CreateClientScopePage";
import { keycloakBefore } from "../support/util/keycloak_before";

let itemId = "client_scope_crud";
const loginPage = new LoginPage();
const masthead = new Masthead();
const sidebarPage = new SidebarPage();
const listingPage = new ListingPage();
const createClientScopePage = new CreateClientScopePage();

describe("Client Scopes test", function () {
  describe("Client Scope creation", function () {
    beforeEach(function () {
      keycloakBefore();
      loginPage.logIn();
      sidebarPage.goToClientScopes();
    });

    it("should fail creating client scope", function () {
      listingPage.goToCreateItem();

      createClientScopePage.save().checkClientNameRequiredMessage();

      createClientScopePage
        .fillClientScopeData("address")
        .save()
        .checkClientNameRequiredMessage(false);

      // The error should inform about duplicated name/id
      masthead.checkNotificationMessage(
        "Could not create client scope: 'Error: Request failed with status code 409'"
      );
    });

    it("Client scope CRUD test", () => {
      itemId += "_" + (Math.random() + 1).toString(36).substring(7);

      // Create
      listingPage.itemExist(itemId, false).goToCreateItem();

      createClientScopePage.fillClientScopeData(itemId).save();

      masthead.checkNotificationMessage("Client scope created");

      sidebarPage.goToClientScopes();

      // Delete
      listingPage.itemExist(itemId).deleteItem(itemId); // There should be a confirmation pop-up

      masthead.checkNotificationMessage("The client scope has been deleted");

      listingPage // It is not refreshing after delete
        .itemExist(itemId, false);
    });
  });
});
