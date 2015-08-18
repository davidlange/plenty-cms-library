/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

/**
 * @module Factories
 */
(function($, pm) {

    /**
     * Displaying error messages and handling wait screen
     * @class UIFactory
     * @static
     */
    pm.factory('UIFactory', function() {
        /**
         * Increased/ decreased when showing/ hiding wait screen to avoid stacking
         * multiple instances of overlays.
         * @attribute waitScreenCount
         * @private
         * @type {number}
         * @default 0
         */
        var waitScreenCount = 0;
        var waitScreenCaller = [];

        return {
            throwError: throwError,
            printErrors: printErrors,
            showWaitScreen: showWaitScreen,
            hideWaitScreen: hideWaitScreen
        };

        /**
         * Display a single error message.
         * @function throwError
         * @param {number} code A code identifying this error
         * @param {string} msg  The error message to display
         */
        function throwError(code, msg) {
            printErrors([{code: code, message: msg}]);
        }

        /**
         * Wrap error messages in error popup, if popup doesn't already contain this error
         * If popup is already visible, append new errors to popup's inner HTML
         * otherwise create new popup
         * @function printErrors
         * @param {Array} errorMessages A list of errors to display
         */

        function printErrors(errorMessages) {
            var popup = $('#CheckoutErrorPane');
            var errorHtml = '';

            // create error-popup if not exist
            if( popup.length <= 0 ) {
                popup = $('<div class="plentyErrorBox" id="CheckoutErrorPane" style="display: none;"><button class="close" type="button"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button><div class="plentyErrorBoxInner"></div></div>');

                $('body').append(popup);
                // bind popups 'close'-button
                popup.find('.close').click(function() {
                    popup.hide();
                });
            }

            $.each(errorMessages, function(key, error) {
                // add additional error, if not exist.
                if( !popup.is(':visible') || popup.find('[data-plenty-error-code="'+error.code+'"]').length <= 0 ) {
                    errorHtml += '\
					<div class="plentyErrorBoxContent" data-plenty-error-code="'+error.code+'">\
						<span class="PlentyErrorCode">Code '+error.code+':</span>\
						<span class="PlentyErrorMsg">'+error.message+'</span>\
					</div>';
                }
            });

            if( popup.is(':visible') ) {
                // append new error to existing errors, if popup is already visible
                popup.find('.plentyErrorBoxInner').append(errorHtml);
            } else {
                // replace generated error-HTML and show popup
                popup.find('.plentyErrorBoxInner').html(errorHtml);
                popup.show();
            }

            hideWaitScreen("printErrors", true);
        }


        /**
         * Show wait screen if not visible and increase
         * {{#crossLink "UIFactory/waitScreenCount:attribute"}}waitScreenCount{{/crossLink}}
         * @function showWaitScreen
         */
        function showWaitScreen(caller) {
            waitScreenCount = waitScreenCount || 0;

            if (!caller) {
                console.warn("Missing calling function for Wait Screen!");
            } else {
                waitScreenCaller.push(caller);
            }

            var waitScreen = $('#PlentyWaitScreen');
            // create wait-overlay if not exist
            if( waitScreen.length <= 0 ) {
                waitScreen = $('<div id="PlentyWaitScreen" class="overlay overlay-wait in"></div>');
                $('body').append(waitScreen);
            } else {
                // show wait screen if not already visible
                waitScreen.addClass('in');
            }

            // increase instance counter to avoid showing multiple overlays
            waitScreenCount++;
            return waitScreenCount;
        }

        /**
         * Decrease {{#crossLink "UIFactory/waitScreenCount:attribute"}}waitScreenCount{{/crossLink}}
         * and hide wait screen if waitScreenCount is 0
         * @function hideWaitScreen
         * @param {boolean} forceClose set true to hide wait screen independent from the value of waitScreenCount.
         */
        function hideWaitScreen( caller, forceClose ) {

            // decrease overlay count
            waitScreenCount--;

            if (!caller) {
                console.warn("Missing calling function for Wait Screen!");
            } else {
                // remove caller from list
                for (var i = waitScreenCaller.length - 1; i >= 0; i--) {
                    if (waitScreenCaller[i] === caller) {
                        waitScreenCaller.splice(i, 1);
                    }
                }
            }

            // hide if all instances of overlays has been closed
            // or if closing is forced by user
            if( waitScreenCount <= 0 || !!forceClose ) {
                waitScreenCount = 0;
                $('#PlentyWaitScreen').removeClass('in');
            }
            return waitScreenCount;
        }

    });
}(jQuery, PlentyFramework));