<a name="2.1.4"></a>
## [2.1.4](https://github.com/mongodb-js/mongodb-extjson/compare/v2.1.3...v2.1.4) (2018-05-31)


### Bug Fixes

* **binary:** generate valid base64 for non-Buffer types ([44afbb8](https://github.com/mongodb-js/mongodb-extjson/commit/44afbb8))
* **parsing:** support encoding and decoding RegExps ([06691f6](https://github.com/mongodb-js/mongodb-extjson/commit/06691f6))



<a name="2.1.3"></a>
## [2.1.3](https://github.com/mongodb-js/mongodb-extjson/compare/v2.1.2...v2.1.3) (2018-05-01)


### Bug Fixes

* **date:** fix date decode in relaxed mode ([#13](https://github.com/mongodb-js/mongodb-extjson/issues/13)) ([dc416aa](https://github.com/mongodb-js/mongodb-extjson/commit/dc416aa))



<a name="2.1.2"></a>
## [2.1.2](https://github.com/mongodb-js/mongodb-extjson/compare/v2.1.1...v2.1.2) (2018-04-06)


### Features

* **bson:** bump dependency on js-bson to track 2.x ([f00bc9f](https://github.com/mongodb-js/mongodb-extjson/commit/f00bc9f))



<a name="2.1.1"></a>
## [2.1.1](https://github.com/mongodb-js/mongodb-extjson/compare/v2.0.0...v2.1.1) (2018-04-01)


### Features

* **browser:** Added browser parameter in package.json pointing to transpiled dist ([97b0feb](https://github.com/mongodb-js/mongodb-extjson/commit/97b0feb))
* **double:** supported relaxed mode for double parsing ([0ee5016](https://github.com/mongodb-js/mongodb-extjson/commit/0ee5016))
* **int32:** support relaxed parsing of int32 types ([c8513cb](https://github.com/mongodb-js/mongodb-extjson/commit/c8513cb))
* **long:** support relaxed parsing of long types ([ac52ae5](https://github.com/mongodb-js/mongodb-extjson/commit/ac52ae5))
* **parsing:** support relaxed parsing of extended json ([92e06d3](https://github.com/mongodb-js/mongodb-extjson/commit/92e06d3))



<a name="2.0.0"></a>
# 2.0.0 (2017-11-20)


### Features

* make compliant with extended JSON 2.0.0 spec and add corpus tests ([7818d61](https://github.com/mongodb-js/mongodb-extjson/commit/7818d61))
* **binary:** removing browser buffer support ([dc556c8](https://github.com/mongodb-js/mongodb-extjson/commit/dc556c8))


### BREAKING CHANGES


* Methods now exist on a global instance of ExtJSON. Whereas previously the library was consumed as such:

  ```js
  const extJSON = require('mongodb-extjson');
  const EJSON = new extJSON();
  EJSON.parse(...);
  ```

  it is now consumed thusly:
  ```js
  const EJSON = require('mongodb-extjson');
  EJSON.parse(...);
  ```
* **binary:** Removes out-of-box support for Binary serialization on web platforms.
Users will have to polyfill node Buffer type
* Library is now compliant with [Extended JSON v2.0.0](https://github.com/mongodb/specifications/blob/a3023304d2883f550b6550a096e0d1ae54c9c102/source/extended-json.rst), and as such may not be compatible with v1.0.0 Extended JSON objects.




<a name="1.0.5"></a>
## 1.0.5 (2017-05-24)


### Bug Fixes

* **parse:** properly support null values in parsed strings ([b3f88f9](https://github.com/mongodb-js/mongodb-extjson/commit/b3f88f9)), closes [#2](https://github.com/mongodb-js/mongodb-extjson/issues/2)
* **serialize:** properly serialize BSON types when used as values ([66fe3d9](https://github.com/mongodb-js/mongodb-extjson/commit/66fe3d9)), closes [#1](https://github.com/mongodb-js/mongodb-extjson/issues/1)



<a name="1.0.4"></a>
## 1.0.4 (2017-03-15)



<a name="1.0.3"></a>
## 1.0.3 (2017-03-02)



<a name="1.0.2"></a>
## 1.0.2 (2017-03-01)



<a name="1.0.1"></a>
## 1.0.1 (2017-03-01)



<a name="1.0.0"></a>
# 1.0.0 (2017-03-01)



