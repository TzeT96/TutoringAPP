/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./src/components/Layout.tsx":
/*!***********************************!*\
  !*** ./src/components/Layout.tsx ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Layout)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/link */ \"./node_modules/next/link.js\");\n/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nfunction Layout({ children }) {\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_2__.useRouter)();\n    // Check if we're on the student page or main page\n    const isStudentPage = router.pathname.startsWith(\"/student\");\n    const isMainPage = router.pathname === \"/\";\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"min-h-screen bg-gray-50\",\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"header\", {\n                className: \"bg-white shadow-sm\",\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"nav\", {\n                    className: \"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between\",\n                    children: isStudentPage ? // No link for student pages\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"flex items-center space-x-2 text-xl font-semibold text-gray-900\",\n                        children: [\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"img\", {\n                                src: \"/images/logo.svg\",\n                                alt: \"Tutoring App Logo\",\n                                width: 40,\n                                height: 40,\n                                className: \"h-10 w-10\"\n                            }, void 0, false, {\n                                fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/components/Layout.tsx\",\n                                lineNumber: 19,\n                                columnNumber: 15\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                                children: \"Tutoring App\"\n                            }, void 0, false, {\n                                fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/components/Layout.tsx\",\n                                lineNumber: 20,\n                                columnNumber: 15\n                            }, this)\n                        ]\n                    }, void 0, true, {\n                        fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/components/Layout.tsx\",\n                        lineNumber: 18,\n                        columnNumber: 13\n                    }, this) : // Link for non-student pages\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_1___default()), {\n                        href: \"/\",\n                        className: \"flex items-center space-x-2 text-xl font-semibold text-gray-900 hover:text-gray-700\",\n                        children: [\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"img\", {\n                                src: \"/images/logo.svg\",\n                                alt: \"Tutoring App Logo\",\n                                width: 40,\n                                height: 40,\n                                className: \"h-10 w-10\"\n                            }, void 0, false, {\n                                fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/components/Layout.tsx\",\n                                lineNumber: 25,\n                                columnNumber: 15\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                                children: \"Tutoring App\"\n                            }, void 0, false, {\n                                fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/components/Layout.tsx\",\n                                lineNumber: 26,\n                                columnNumber: 15\n                            }, this)\n                        ]\n                    }, void 0, true, {\n                        fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/components/Layout.tsx\",\n                        lineNumber: 24,\n                        columnNumber: 13\n                    }, this)\n                }, void 0, false, {\n                    fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/components/Layout.tsx\",\n                    lineNumber: 15,\n                    columnNumber: 9\n                }, this)\n            }, void 0, false, {\n                fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/components/Layout.tsx\",\n                lineNumber: 14,\n                columnNumber: 7\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"main\", {\n                className: \"max-w-7xl mx-auto py-6 sm:px-6 lg:px-8\",\n                children: children\n            }, void 0, false, {\n                fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/components/Layout.tsx\",\n                lineNumber: 31,\n                columnNumber: 7\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/components/Layout.tsx\",\n        lineNumber: 13,\n        columnNumber: 5\n    }, this);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY29tcG9uZW50cy9MYXlvdXQudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQzZCO0FBQ1c7QUFFekIsU0FBU0UsT0FBTyxFQUFFQyxRQUFRLEVBQTJCO0lBQ2xFLE1BQU1DLFNBQVNILHNEQUFTQTtJQUV4QixrREFBa0Q7SUFDbEQsTUFBTUksZ0JBQWdCRCxPQUFPRSxRQUFRLENBQUNDLFVBQVUsQ0FBQztJQUNqRCxNQUFNQyxhQUFhSixPQUFPRSxRQUFRLEtBQUs7SUFFdkMscUJBQ0UsOERBQUNHO1FBQUlDLFdBQVU7OzBCQUNiLDhEQUFDQztnQkFBT0QsV0FBVTswQkFDaEIsNEVBQUNFO29CQUFJRixXQUFVOzhCQUNaTCxnQkFDQyw0QkFBNEI7a0NBQzVCLDhEQUFDSTt3QkFBSUMsV0FBVTs7MENBQ2IsOERBQUNHO2dDQUFJQyxLQUFJO2dDQUFtQkMsS0FBSTtnQ0FBb0JDLE9BQU87Z0NBQUlDLFFBQVE7Z0NBQUlQLFdBQVU7Ozs7OzswQ0FDckYsOERBQUNROzBDQUFLOzs7Ozs7Ozs7OzsrQkFHUiw2QkFBNkI7a0NBQzdCLDhEQUFDbEIsa0RBQUlBO3dCQUFDbUIsTUFBSzt3QkFBSVQsV0FBVTs7MENBQ3ZCLDhEQUFDRztnQ0FBSUMsS0FBSTtnQ0FBbUJDLEtBQUk7Z0NBQW9CQyxPQUFPO2dDQUFJQyxRQUFRO2dDQUFJUCxXQUFVOzs7Ozs7MENBQ3JGLDhEQUFDUTswQ0FBSzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzswQkFLZCw4REFBQ0U7Z0JBQUtWLFdBQVU7MEJBQ2JQOzs7Ozs7Ozs7Ozs7QUFJVCIsInNvdXJjZXMiOlsid2VicGFjazovL3R1dG9yaW5nLXdlYi11aS8uL3NyYy9jb21wb25lbnRzL0xheW91dC50c3g/ZGU4YiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBSZWFjdE5vZGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgTGluayBmcm9tICduZXh0L2xpbmsnO1xuaW1wb3J0IHsgdXNlUm91dGVyIH0gZnJvbSAnbmV4dC9yb3V0ZXInO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBMYXlvdXQoeyBjaGlsZHJlbiB9OiB7IGNoaWxkcmVuOiBSZWFjdE5vZGUgfSkge1xuICBjb25zdCByb3V0ZXIgPSB1c2VSb3V0ZXIoKTtcbiAgXG4gIC8vIENoZWNrIGlmIHdlJ3JlIG9uIHRoZSBzdHVkZW50IHBhZ2Ugb3IgbWFpbiBwYWdlXG4gIGNvbnN0IGlzU3R1ZGVudFBhZ2UgPSByb3V0ZXIucGF0aG5hbWUuc3RhcnRzV2l0aCgnL3N0dWRlbnQnKTtcbiAgY29uc3QgaXNNYWluUGFnZSA9IHJvdXRlci5wYXRobmFtZSA9PT0gJy8nO1xuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJtaW4taC1zY3JlZW4gYmctZ3JheS01MFwiPlxuICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJiZy13aGl0ZSBzaGFkb3ctc21cIj5cbiAgICAgICAgPG5hdiBjbGFzc05hbWU9XCJtYXgtdy03eGwgbXgtYXV0byBweC00IHNtOnB4LTYgbGc6cHgtOCBoLTE2IGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlblwiPlxuICAgICAgICAgIHtpc1N0dWRlbnRQYWdlID8gKFxuICAgICAgICAgICAgLy8gTm8gbGluayBmb3Igc3R1ZGVudCBwYWdlc1xuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBzcGFjZS14LTIgdGV4dC14bCBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDBcIj5cbiAgICAgICAgICAgICAgPGltZyBzcmM9XCIvaW1hZ2VzL2xvZ28uc3ZnXCIgYWx0PVwiVHV0b3JpbmcgQXBwIExvZ29cIiB3aWR0aD17NDB9IGhlaWdodD17NDB9IGNsYXNzTmFtZT1cImgtMTAgdy0xMFwiIC8+XG4gICAgICAgICAgICAgIDxzcGFuPlR1dG9yaW5nIEFwcDwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAvLyBMaW5rIGZvciBub24tc3R1ZGVudCBwYWdlc1xuICAgICAgICAgICAgPExpbmsgaHJlZj1cIi9cIiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBzcGFjZS14LTIgdGV4dC14bCBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgaG92ZXI6dGV4dC1ncmF5LTcwMFwiPlxuICAgICAgICAgICAgICA8aW1nIHNyYz1cIi9pbWFnZXMvbG9nby5zdmdcIiBhbHQ9XCJUdXRvcmluZyBBcHAgTG9nb1wiIHdpZHRoPXs0MH0gaGVpZ2h0PXs0MH0gY2xhc3NOYW1lPVwiaC0xMCB3LTEwXCIgLz5cbiAgICAgICAgICAgICAgPHNwYW4+VHV0b3JpbmcgQXBwPC9zcGFuPlxuICAgICAgICAgICAgPC9MaW5rPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvbmF2PlxuICAgICAgPC9oZWFkZXI+XG4gICAgICA8bWFpbiBjbGFzc05hbWU9XCJtYXgtdy03eGwgbXgtYXV0byBweS02IHNtOnB4LTYgbGc6cHgtOFwiPlxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICA8L21haW4+XG4gICAgPC9kaXY+XG4gICk7XG59ICJdLCJuYW1lcyI6WyJMaW5rIiwidXNlUm91dGVyIiwiTGF5b3V0IiwiY2hpbGRyZW4iLCJyb3V0ZXIiLCJpc1N0dWRlbnRQYWdlIiwicGF0aG5hbWUiLCJzdGFydHNXaXRoIiwiaXNNYWluUGFnZSIsImRpdiIsImNsYXNzTmFtZSIsImhlYWRlciIsIm5hdiIsImltZyIsInNyYyIsImFsdCIsIndpZHRoIiwiaGVpZ2h0Iiwic3BhbiIsImhyZWYiLCJtYWluIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/components/Layout.tsx\n");

/***/ }),

/***/ "./src/pages/_app.tsx":
/*!****************************!*\
  !*** ./src/pages/_app.tsx ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ App)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _components_Layout__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/components/Layout */ \"./src/components/Layout.tsx\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/styles/globals.css */ \"./src/styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nfunction App({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_Layout__WEBPACK_IMPORTED_MODULE_1__[\"default\"], {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n            ...pageProps\n        }, void 0, false, {\n            fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/pages/_app.tsx\",\n            lineNumber: 8,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/pages/_app.tsx\",\n        lineNumber: 7,\n        columnNumber: 5\n    }, this);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcGFnZXMvX2FwcC50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUN5QztBQUNYO0FBRWYsU0FBU0MsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBWTtJQUM1RCxxQkFDRSw4REFBQ0gsMERBQU1BO2tCQUNMLDRFQUFDRTtZQUFXLEdBQUdDLFNBQVM7Ozs7Ozs7Ozs7O0FBRzlCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdHV0b3Jpbmctd2ViLXVpLy4vc3JjL3BhZ2VzL19hcHAudHN4P2Y5ZDYiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBBcHBQcm9wcyB9IGZyb20gJ25leHQvYXBwJztcbmltcG9ydCBMYXlvdXQgZnJvbSAnQC9jb21wb25lbnRzL0xheW91dCc7XG5pbXBvcnQgJ0Avc3R5bGVzL2dsb2JhbHMuY3NzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQXBwKHsgQ29tcG9uZW50LCBwYWdlUHJvcHMgfTogQXBwUHJvcHMpIHtcbiAgcmV0dXJuIChcbiAgICA8TGF5b3V0PlxuICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxuICAgIDwvTGF5b3V0PlxuICApO1xufSAiXSwibmFtZXMiOlsiTGF5b3V0IiwiQXBwIiwiQ29tcG9uZW50IiwicGFnZVByb3BzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/pages/_app.tsx\n");

/***/ }),

/***/ "./src/styles/globals.css":
/*!********************************!*\
  !*** ./src/styles/globals.css ***!
  \********************************/
/***/ (() => {



/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-dom");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "react/jsx-runtime":
/*!************************************!*\
  !*** external "react/jsx-runtime" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc"], () => (__webpack_exec__("./src/pages/_app.tsx")));
module.exports = __webpack_exports__;

})();