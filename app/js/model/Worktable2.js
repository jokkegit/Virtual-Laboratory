define([
    'knockout',
    'base',
    'model/TubeRack',
    'model/TableSpace',
    'model/ContainerType',
    'model/ODMachine'
], function(ko, Base, TubeRackModel, TableSpaceModel, ContainerType, ODMachineModel) {

    var Worktable2 = Base.extend({

        constructor: function () {
            var self = this;

            self.tableSpacePetri = new TableSpaceModel(ContainerType.PETRI_DISH);
            self.tableSpaceMicro = new TableSpaceModel(ContainerType.MICROTITER);
            self.tubeRack = new TubeRackModel();
            self.odMachine = new ODMachineModel();

            // TODO: blender
        }
    });

    return Worktable2;
});