import type BaseController from './BaseController';

interface ResponseOptions {
  body?: {}; //  validate incoming body.
  query?: {}; // validate query string or URL parameters.
  params?: {}; // validate path parameters.
  header?: {}; // validate request's headers.
  response?: {}; // validate response type.
  beforeHandle?: (ctx: any) => 'unauthorized' | string | undefined; // before handling the request
}

function useBefore(handler: unknown) {
  return function(value: BaseController, context: ClassMethodDecoratorContext) {
    value.middlewares.push(handler);
  };
}

function Get(path: string, responseOptions: ResponseOptions = {}) {
  return function(
    value: BaseController,
    context: ClassMethodDecoratorContext
  ) {
    if (!value["routes"]) {
      value["routes"] = [];
    }
    value.routes.push({
      method: "get",
      path,
      handler: value[context.name],
      responseOptions,
    });
  };
}

function Post(path: string, responseOptions: ResponseOptions = {}) {
  return function(
    value: BaseController,
    context: ClassMethodDecoratorContext
  ) {
    if (!value["routes"]) {
      value["routes"] = [];
    }
    value.routes.push({
      method: "post",
      path,
      handler: value[context.name],
      responseOptions,
    });
  };
}

function Put(path: string, responseOptions: ResponseOptions = {}) {
  return function(
    value: BaseController,
    context: ClassMethodDecoratorContext
  ) {
    if (!value["routes"]) {
      value["routes"] = [];
    }
    value.routes.push({
      method: "put",
      path,
      handler: value[context.name],
      responseOptions,
    });
  };
}

function Delete(path: string, responseOptions: ResponseOptions = {}) {
  return function(
    value: BaseController,
    context: ClassMethodDecoratorContext
  ) {
    if (!value["routes"]) {
      value["routes"] = [];
    }
    value.routes.push({
      method: "delete",
      path,
      handler: value[context.name],
      responseOptions,
    });
  };
}

export { Get, Post, Put, Delete, useBefore };
