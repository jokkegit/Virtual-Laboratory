define([
    'knockout',
    'lodash',
    'base',
    'utils/TextHelper'
], function (ko, _, Base, TextHelper) {
    var Inventory = Base.extend({

        constructor: function () {
            var self = this;

            self.items = ko.observableArray([]);

            self.add = function(item) {
                // TODO: validate that an item can be placed here (via `accept`)


                // generate default label
                if (item.label && _.isEmpty(item.label())) {
                    item.label(TextHelper.label(item));
                }

                self.items.push(item);
            };

            self.hasItem = function(item) {
                return _.contains(self.items(), item);
            };

            self.remove = function (item) {
                self.items.remove(item);
            };
        }
    });

    return Inventory;
});
