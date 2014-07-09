define([
    'knockout',
    'base'
], function (ko, Base) {

    var Liquid = Base.extend({
        constructor: function (type, reactionCount) {
            var self = this;

            self.type = ko.observable(type);
            self.reactionCount = ko.observable(reactionCount);
            self.hasReacted = ko.observable(false);
            self.react = function (container) {};
        }
    });

    return Liquid;
});