"use strict";

import path from "path";

import { expect } from "chai";
import restify from "restify";
import supertest from "supertest";

import Router from "../src/router";
import Loader from "../src/loader";

const controllerLoader = new Loader({
  type: "controller",
  path: path.resolve(__dirname, "fixtures/controllers")
})

describe("Router", function () {
  describe("map", function () {
    it("returns an instance of Router", function () {
      const router = Router.map({}, function () {});

      expect(router).to.be.an.instanceof(Router);
    });

    it("calls callback with an instance of Router", function () {
      Router.map({}, function () {
        expect(this).to.be.an.instanceof(Router);
      });
    });
  });

  describe("#resource", function () {
    let app, client, router;

    beforeEach(function () {
      app = restify.createServer();
      router = new Router({
        app,
        loader: { controllers: controllerLoader }
      });
      router.resource("foo");

      client = supertest(app);
    });

    it("maps a resource to a controller's index method", function (done) {
      client.get("/foos")
        .expect(200, { foos: [] })
        .end(done);
    });

    it("maps a resource to a controller's show method", function (done) {
      client.get("/foos/1")
        .expect(200, { foo: {}})
        .end(done);
    });

    it("maps a resource to a controller's create method", function (done) {
      client.post("/foos")
        .send({ name: "bar" })
        .expect(201)
        .end(done);
    });

    it("maps a resource to a controller's update method", function (done) {
      client.put("/foos/1")
        .send({ name: "baz" })
        .expect(200)
        .end(done);
    });

    it("maps a resource to a controller's destroy method", function (done) {
      client.del("/foos/1")
        .expect(204)
        .end(done);
    });
  });
});
