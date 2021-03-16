import {routeMatcher, router} from "./routeMatcher"

  test('check module', () => {
    expect(typeof routeMatcher).toBe("function")
  });

  test('check equal basic route', () => {
    expect(routeMatcher("/base/comp1", "/base/comp1")).toEqual({});
  });

  test('check non equal basic route', () => {
    expect(routeMatcher("/base/comp1", "/base/comp2")).toBe(null);
  });
  
  test('check parametric route', () => {
    expect(routeMatcher("/base/aaa", "/base/:param1")).toEqual({"param1": "aaa"});
  });
  
  test('parametric route url has to few parameters ', () => {
    expect(routeMatcher("/base/aaa", "/base/:param1/:param2")).toEqual(null);
  });
    
  test('parametric route with multiple parameters', () => {
    expect(routeMatcher("/base/aaa/bbbb", "/base/:param1/:param2")).toEqual({"param1": "aaa", "param2": "bbbb"});
  });

  test('router runs the associated function', () => {
    const url = "vurdering/info/1235"
    const routes = [
        ["vurdering/:id", (params) => "vurdering:" + params.id ],
        ["vurdering/info/:id", (params) => "vurdering info:" + params.id ]
    ]
    const result = router(url, routes)
    expect(result).toBe("vurdering info:1235")
  });

  test('router returns undefined when no match', () => {
    const url = "tull/1235"
    const routes = [
        ["vurdering/:id", params => "vurdering:" + params.id ],
        ["vurdering/info/:id", params => "vurdering info:" + params.id ]
    ]
    const result = router(url, routes)
    expect(result).toBe(undefined)
  });

