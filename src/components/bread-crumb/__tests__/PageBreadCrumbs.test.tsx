import React from "react";
import { mount } from "enzyme";
import { PageBreadCrumbs } from "../PageBreadCrumbs";
import { MemoryRouter } from "react-router-dom";

describe("BreadCrumbs tests", () => {
  it("couple of crumbs", () => {
    const crumbs = mount(
      <MemoryRouter initialEntries={["/master/clients/1234/settings"]}>
        <PageBreadCrumbs />
      </MemoryRouter>
    );
    expect(crumbs.find(PageBreadCrumbs)).toMatchSnapshot();
  });
});
