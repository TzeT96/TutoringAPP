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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Layout)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_auth_react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/react */ \"next-auth/react\");\n/* harmony import */ var next_auth_react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth_react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/link */ \"./node_modules/next/link.js\");\n/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_3__);\n\n\n\n\nfunction Layout({ children }) {\n    const { data: session } = (0,next_auth_react__WEBPACK_IMPORTED_MODULE_1__.useSession)();\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter)();\n    // Check if we're on the student page or main page\n    const isStudentPage = router.pathname.startsWith(\"/student\");\n    const isMainPage = router.pathname === \"/\";\n    const handleSignOut = async ()=>{\n        // Get the base URL from the current window location\n        const baseUrl = window.location.origin;\n        await (0,next_auth_react__WEBPACK_IMPORTED_MODULE_1__.signOut)({\n            redirect: true,\n            callbackUrl: `${baseUrl}/auth/signin`\n        });\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"min-h-screen bg-gray-50\",\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"header\", {\n                className: \"bg-white shadow-sm\",\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"nav\", {\n                    className: \"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between\",\n                    children: [\n                        isStudentPage ? // No link for student pages\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                            className: \"flex items-center space-x-2 text-xl font-semibold text-gray-900\",\n                            children: [\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"img\", {\n                                    src: \"/images/logo.svg\",\n                                    alt: \"Tutoring App Logo\",\n                                    width: 40,\n                                    height: 40,\n                                    className: \"h-10 w-10\"\n                                }, void 0, false, {\n                                    fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/components/Layout.tsx\",\n                                    lineNumber: 30,\n                                    columnNumber: 15\n                                }, this),\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                                    children: \"Tutoring App\"\n                                }, void 0, false, {\n                                    fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/components/Layout.tsx\",\n                                    lineNumber: 31,\n                                    columnNumber: 15\n                                }, this)\n                            ]\n                        }, void 0, true, {\n                            fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/components/Layout.tsx\",\n                            lineNumber: 29,\n                            columnNumber: 13\n                        }, this) : // Link for non-student pages\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_2___default()), {\n                            href: \"/\",\n                            className: \"flex items-center space-x-2 text-xl font-semibold text-gray-900 hover:text-gray-700\",\n                            children: [\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"img\", {\n                                    src: \"/images/logo.svg\",\n                                    alt: \"Tutoring App Logo\",\n                                    width: 40,\n                                    height: 40,\n                                    className: \"h-10 w-10\"\n                                }, void 0, false, {\n                                    fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/components/Layout.tsx\",\n                                    lineNumber: 36,\n                                    columnNumber: 15\n                                }, this),\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                                    children: \"Tutoring App\"\n                                }, void 0, false, {\n                                    fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/components/Layout.tsx\",\n                                    lineNumber: 37,\n                                    columnNumber: 15\n                                }, this)\n                            ]\n                        }, void 0, true, {\n                            fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/components/Layout.tsx\",\n                            lineNumber: 35,\n                            columnNumber: 13\n                        }, this),\n                        session && !isStudentPage && !isMainPage && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                            className: \"flex items-center gap-4\",\n                            children: [\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                                    className: \"text-sm text-gray-600\",\n                                    children: session.user?.email\n                                }, void 0, false, {\n                                    fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/components/Layout.tsx\",\n                                    lineNumber: 43,\n                                    columnNumber: 15\n                                }, this),\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                                    onClick: handleSignOut,\n                                    className: \"px-4 py-2 text-sm text-red-600 hover:text-red-800\",\n                                    children: \"Sign Out\"\n                                }, void 0, false, {\n                                    fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/components/Layout.tsx\",\n                                    lineNumber: 46,\n                                    columnNumber: 15\n                                }, this)\n                            ]\n                        }, void 0, true, {\n                            fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/components/Layout.tsx\",\n                            lineNumber: 42,\n                            columnNumber: 13\n                        }, this)\n                    ]\n                }, void 0, true, {\n                    fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/components/Layout.tsx\",\n                    lineNumber: 26,\n                    columnNumber: 9\n                }, this)\n            }, void 0, false, {\n                fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/components/Layout.tsx\",\n                lineNumber: 25,\n                columnNumber: 7\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"main\", {\n                className: \"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8\",\n                children: children\n            }, void 0, false, {\n                fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/components/Layout.tsx\",\n                lineNumber: 56,\n                columnNumber: 7\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/components/Layout.tsx\",\n        lineNumber: 24,\n        columnNumber: 5\n    }, this);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY29tcG9uZW50cy9MYXlvdXQudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFDc0Q7QUFDekI7QUFDVztBQUV6QixTQUFTSSxPQUFPLEVBQUVDLFFBQVEsRUFBMkI7SUFDbEUsTUFBTSxFQUFFQyxNQUFNQyxPQUFPLEVBQUUsR0FBR1AsMkRBQVVBO0lBQ3BDLE1BQU1RLFNBQVNMLHNEQUFTQTtJQUV4QixrREFBa0Q7SUFDbEQsTUFBTU0sZ0JBQWdCRCxPQUFPRSxRQUFRLENBQUNDLFVBQVUsQ0FBQztJQUNqRCxNQUFNQyxhQUFhSixPQUFPRSxRQUFRLEtBQUs7SUFFdkMsTUFBTUcsZ0JBQWdCO1FBQ3BCLG9EQUFvRDtRQUNwRCxNQUFNQyxVQUFVQyxPQUFPQyxRQUFRLENBQUNDLE1BQU07UUFDdEMsTUFBTWhCLHdEQUFPQSxDQUFDO1lBQ1ppQixVQUFVO1lBQ1ZDLGFBQWEsQ0FBQyxFQUFFTCxRQUFRLFlBQVksQ0FBQztRQUN2QztJQUNGO0lBRUEscUJBQ0UsOERBQUNNO1FBQUlDLFdBQVU7OzBCQUNiLDhEQUFDQztnQkFBT0QsV0FBVTswQkFDaEIsNEVBQUNFO29CQUFJRixXQUFVOzt3QkFDWlosZ0JBQ0MsNEJBQTRCO3NDQUM1Qiw4REFBQ1c7NEJBQUlDLFdBQVU7OzhDQUNiLDhEQUFDRztvQ0FBSUMsS0FBSTtvQ0FBbUJDLEtBQUk7b0NBQW9CQyxPQUFPO29DQUFJQyxRQUFRO29DQUFJUCxXQUFVOzs7Ozs7OENBQ3JGLDhEQUFDUTs4Q0FBSzs7Ozs7Ozs7Ozs7bUNBR1IsNkJBQTZCO3NDQUM3Qiw4REFBQzNCLGtEQUFJQTs0QkFBQzRCLE1BQUs7NEJBQUlULFdBQVU7OzhDQUN2Qiw4REFBQ0c7b0NBQUlDLEtBQUk7b0NBQW1CQyxLQUFJO29DQUFvQkMsT0FBTztvQ0FBSUMsUUFBUTtvQ0FBSVAsV0FBVTs7Ozs7OzhDQUNyRiw4REFBQ1E7OENBQUs7Ozs7Ozs7Ozs7Ozt3QkFJVHRCLFdBQVcsQ0FBQ0UsaUJBQWlCLENBQUNHLDRCQUM3Qiw4REFBQ1E7NEJBQUlDLFdBQVU7OzhDQUNiLDhEQUFDUTtvQ0FBS1IsV0FBVTs4Q0FDYmQsUUFBUXdCLElBQUksRUFBRUM7Ozs7Ozs4Q0FFakIsOERBQUNDO29DQUNDQyxTQUFTckI7b0NBQ1RRLFdBQVU7OENBQ1g7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzBCQU9ULDhEQUFDYztnQkFBS2QsV0FBVTswQkFDYmhCOzs7Ozs7Ozs7Ozs7QUFJVCIsInNvdXJjZXMiOlsid2VicGFjazovL3R1dG9yaW5nLXdlYi11aS8uL3NyYy9jb21wb25lbnRzL0xheW91dC50c3g/ZGU4YiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBSZWFjdE5vZGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VTZXNzaW9uLCBzaWduT3V0IH0gZnJvbSAnbmV4dC1hdXRoL3JlYWN0JztcbmltcG9ydCBMaW5rIGZyb20gJ25leHQvbGluayc7XG5pbXBvcnQgeyB1c2VSb3V0ZXIgfSBmcm9tICduZXh0L3JvdXRlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIExheW91dCh7IGNoaWxkcmVuIH06IHsgY2hpbGRyZW46IFJlYWN0Tm9kZSB9KSB7XG4gIGNvbnN0IHsgZGF0YTogc2Vzc2lvbiB9ID0gdXNlU2Vzc2lvbigpO1xuICBjb25zdCByb3V0ZXIgPSB1c2VSb3V0ZXIoKTtcbiAgXG4gIC8vIENoZWNrIGlmIHdlJ3JlIG9uIHRoZSBzdHVkZW50IHBhZ2Ugb3IgbWFpbiBwYWdlXG4gIGNvbnN0IGlzU3R1ZGVudFBhZ2UgPSByb3V0ZXIucGF0aG5hbWUuc3RhcnRzV2l0aCgnL3N0dWRlbnQnKTtcbiAgY29uc3QgaXNNYWluUGFnZSA9IHJvdXRlci5wYXRobmFtZSA9PT0gJy8nO1xuXG4gIGNvbnN0IGhhbmRsZVNpZ25PdXQgPSBhc3luYyAoKSA9PiB7XG4gICAgLy8gR2V0IHRoZSBiYXNlIFVSTCBmcm9tIHRoZSBjdXJyZW50IHdpbmRvdyBsb2NhdGlvblxuICAgIGNvbnN0IGJhc2VVcmwgPSB3aW5kb3cubG9jYXRpb24ub3JpZ2luO1xuICAgIGF3YWl0IHNpZ25PdXQoeyBcbiAgICAgIHJlZGlyZWN0OiB0cnVlLFxuICAgICAgY2FsbGJhY2tVcmw6IGAke2Jhc2VVcmx9L2F1dGgvc2lnbmluYFxuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJtaW4taC1zY3JlZW4gYmctZ3JheS01MFwiPlxuICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJiZy13aGl0ZSBzaGFkb3ctc21cIj5cbiAgICAgICAgPG5hdiBjbGFzc05hbWU9XCJtYXgtdy03eGwgbXgtYXV0byBweC00IHNtOnB4LTYgbGc6cHgtOCBoLTE2IGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlblwiPlxuICAgICAgICAgIHtpc1N0dWRlbnRQYWdlID8gKFxuICAgICAgICAgICAgLy8gTm8gbGluayBmb3Igc3R1ZGVudCBwYWdlc1xuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBzcGFjZS14LTIgdGV4dC14bCBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDBcIj5cbiAgICAgICAgICAgICAgPGltZyBzcmM9XCIvaW1hZ2VzL2xvZ28uc3ZnXCIgYWx0PVwiVHV0b3JpbmcgQXBwIExvZ29cIiB3aWR0aD17NDB9IGhlaWdodD17NDB9IGNsYXNzTmFtZT1cImgtMTAgdy0xMFwiIC8+XG4gICAgICAgICAgICAgIDxzcGFuPlR1dG9yaW5nIEFwcDwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAvLyBMaW5rIGZvciBub24tc3R1ZGVudCBwYWdlc1xuICAgICAgICAgICAgPExpbmsgaHJlZj1cIi9cIiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBzcGFjZS14LTIgdGV4dC14bCBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgaG92ZXI6dGV4dC1ncmF5LTcwMFwiPlxuICAgICAgICAgICAgICA8aW1nIHNyYz1cIi9pbWFnZXMvbG9nby5zdmdcIiBhbHQ9XCJUdXRvcmluZyBBcHAgTG9nb1wiIHdpZHRoPXs0MH0gaGVpZ2h0PXs0MH0gY2xhc3NOYW1lPVwiaC0xMCB3LTEwXCIgLz5cbiAgICAgICAgICAgICAgPHNwYW4+VHV0b3JpbmcgQXBwPC9zcGFuPlxuICAgICAgICAgICAgPC9MaW5rPlxuICAgICAgICAgICl9XG4gICAgICAgICAgXG4gICAgICAgICAge3Nlc3Npb24gJiYgIWlzU3R1ZGVudFBhZ2UgJiYgIWlzTWFpblBhZ2UgJiYgKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtNFwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXNtIHRleHQtZ3JheS02MDBcIj5cbiAgICAgICAgICAgICAgICB7c2Vzc2lvbi51c2VyPy5lbWFpbH1cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgb25DbGljaz17aGFuZGxlU2lnbk91dH1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJweC00IHB5LTIgdGV4dC1zbSB0ZXh0LXJlZC02MDAgaG92ZXI6dGV4dC1yZWQtODAwXCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIFNpZ24gT3V0XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9uYXY+XG4gICAgICA8L2hlYWRlcj5cbiAgICAgIDxtYWluIGNsYXNzTmFtZT1cIm1heC13LTd4bCBteC1hdXRvIHB4LTQgc206cHgtNiBsZzpweC04IHB5LThcIj5cbiAgICAgICAge2NoaWxkcmVufVxuICAgICAgPC9tYWluPlxuICAgIDwvZGl2PlxuICApO1xufSAiXSwibmFtZXMiOlsidXNlU2Vzc2lvbiIsInNpZ25PdXQiLCJMaW5rIiwidXNlUm91dGVyIiwiTGF5b3V0IiwiY2hpbGRyZW4iLCJkYXRhIiwic2Vzc2lvbiIsInJvdXRlciIsImlzU3R1ZGVudFBhZ2UiLCJwYXRobmFtZSIsInN0YXJ0c1dpdGgiLCJpc01haW5QYWdlIiwiaGFuZGxlU2lnbk91dCIsImJhc2VVcmwiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsIm9yaWdpbiIsInJlZGlyZWN0IiwiY2FsbGJhY2tVcmwiLCJkaXYiLCJjbGFzc05hbWUiLCJoZWFkZXIiLCJuYXYiLCJpbWciLCJzcmMiLCJhbHQiLCJ3aWR0aCIsImhlaWdodCIsInNwYW4iLCJocmVmIiwidXNlciIsImVtYWlsIiwiYnV0dG9uIiwib25DbGljayIsIm1haW4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/components/Layout.tsx\n");

/***/ }),

/***/ "./src/pages/_app.tsx":
/*!****************************!*\
  !*** ./src/pages/_app.tsx ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ App)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_auth_react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/react */ \"next-auth/react\");\n/* harmony import */ var next_auth_react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth_react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _components_Layout__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/components/Layout */ \"./src/components/Layout.tsx\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/styles/globals.css */ \"./src/styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_3__);\n\n\n\n\nfunction App({ Component, pageProps: { session, ...pageProps } }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(next_auth_react__WEBPACK_IMPORTED_MODULE_1__.SessionProvider, {\n        session: session,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_Layout__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                ...pageProps\n            }, void 0, false, {\n                fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/pages/_app.tsx\",\n                lineNumber: 13,\n                columnNumber: 9\n            }, this)\n        }, void 0, false, {\n            fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/pages/_app.tsx\",\n            lineNumber: 12,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/Users/tommyt/Desktop/InternshipWorks/Internship/WorkInAristAI/3_TutoringAPP/3_TutoringWebUI/src/pages/_app.tsx\",\n        lineNumber: 11,\n        columnNumber: 5\n    }, this);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcGFnZXMvX2FwcC50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQWtEO0FBRVQ7QUFDWDtBQUVmLFNBQVNFLElBQUksRUFDMUJDLFNBQVMsRUFDVEMsV0FBVyxFQUFFQyxPQUFPLEVBQUUsR0FBR0QsV0FBVyxFQUMzQjtJQUNULHFCQUNFLDhEQUFDSiw0REFBZUE7UUFBQ0ssU0FBU0E7a0JBQ3hCLDRFQUFDSiwwREFBTUE7c0JBQ0wsNEVBQUNFO2dCQUFXLEdBQUdDLFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJaEMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90dXRvcmluZy13ZWItdWkvLi9zcmMvcGFnZXMvX2FwcC50c3g/ZjlkNiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTZXNzaW9uUHJvdmlkZXIgfSBmcm9tICduZXh0LWF1dGgvcmVhY3QnO1xuaW1wb3J0IHR5cGUgeyBBcHBQcm9wcyB9IGZyb20gJ25leHQvYXBwJztcbmltcG9ydCBMYXlvdXQgZnJvbSAnQC9jb21wb25lbnRzL0xheW91dCc7XG5pbXBvcnQgJ0Avc3R5bGVzL2dsb2JhbHMuY3NzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQXBwKHsgXG4gIENvbXBvbmVudCwgXG4gIHBhZ2VQcm9wczogeyBzZXNzaW9uLCAuLi5wYWdlUHJvcHMgfSBcbn06IEFwcFByb3BzKSB7XG4gIHJldHVybiAoXG4gICAgPFNlc3Npb25Qcm92aWRlciBzZXNzaW9uPXtzZXNzaW9ufT5cbiAgICAgIDxMYXlvdXQ+XG4gICAgICAgIDxDb21wb25lbnQgey4uLnBhZ2VQcm9wc30gLz5cbiAgICAgIDwvTGF5b3V0PlxuICAgIDwvU2Vzc2lvblByb3ZpZGVyPlxuICApO1xufSAiXSwibmFtZXMiOlsiU2Vzc2lvblByb3ZpZGVyIiwiTGF5b3V0IiwiQXBwIiwiQ29tcG9uZW50IiwicGFnZVByb3BzIiwic2Vzc2lvbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/pages/_app.tsx\n");

/***/ }),

/***/ "./src/styles/globals.css":
/*!********************************!*\
  !*** ./src/styles/globals.css ***!
  \********************************/
/***/ (() => {



/***/ }),

/***/ "next-auth/react":
/*!**********************************!*\
  !*** external "next-auth/react" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("next-auth/react");

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