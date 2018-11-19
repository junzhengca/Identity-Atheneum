/**
 * Apply routes to a router, routes must be in following format:
 * {
 *     middlewares: [List of middlewares to apply],
 *     get: [
 *         ["/your-route", handler1, handler2, ...],
 *         ...
 *     ],
 *     post: [ same as get ],
 *     put: [ same as get ],
 *     delete: [same as get ]
 * }
 * @param router
 * @param routes
 */
module.exports = function (router, routes) {
    // Apply all get routes
    routes.get.forEach(route => {
        router.get(route[0], __concatMiddlewaresWithHandlers(routes.middlewares, route));
    });
    // Apply all post routes
    routes.get.forEach(route => {
        router.post(route[0], __concatMiddlewaresWithHandlers(routes.middlewares, route));
    });
    // Apply all put routes
    routes.get.forEach(route => {
        router.put(route[0], __concatMiddlewaresWithHandlers(routes.middlewares, route));
    });
    // Apply all delete routes
    routes.get.forEach(route => {
        router.delete(route[0], __concatMiddlewaresWithHandlers(routes.middlewares, route));
    });
};

/**
 * Takes in a list of middlewares and a route, then concat them to form a new new list
 * Route string is discarded.
 * @param middlewares
 * @param route
 * @returns {Array}
 * @private
 */
function __concatMiddlewaresWithHandlers(middlewares, route) {
    let handlers = [...route];
    // Shift one element left, since first element is the route string
    handlers.shift();
    // Concat middleware with actual handlers
    let result = [...middlewares];
    result     = result.concat(handlers);
    return __wrapHandlersWithTryCatch(result);
}

/**
 * Takes a list of handlers as input, wrap it with try catch block that upon catching, goes to next()
 * @param handlers
 * @returns {Array}
 * @private
 */
function __wrapHandlersWithTryCatch(handlers) {
    let _handlers = [];
    handlers.forEach(handler => {
        _handlers.push(async function(req, res, next) {
            try {
                await handler(req, res, next);
            } catch (e) {
                next(e);
            }
        })
    });
    return _handlers;
}