import ko = require('knockout');
import _ = require('lodash');

import heartRateJsonData = require('json!datadir/heartRate.json');
import DataHelper = require('utils/DataHelper');

import VetMonitorBaseViewController = require('controller/view/VetMonitorBaseViewController');
import popupController = require('controller/Popup');
import PlotItemType = require('model/type/PlotItemType');
import PlotDataPointType = require('model/type/PlotDataPointType');
import VetMonitor = require('model/interface/VetMonitor');

import VetMonitorModel = require('model/VetMonitorModel');


class VetMonitorViewController {
    public mouse: KnockoutObservable<MouseModel>;
    public mouseCageHasMouse: KnockoutObservable<boolean>;
    public vetMonitor: VetMonitor;

    public simulationInterval: KnockoutObservable<number>;
    public simulationIntervalTime: number = 100;  // millisecond

    public graphRangeStart: number = 0;
    public graphRangeEnd: number = 250;
    public graphRange: number[];

    public isBloodSugarGraphEnabled: KnockoutObservable<boolean>;
    public graphBloodRange: KnockoutObservableArray<boolean>;
    //public bloodGlucoseData: KnockoutObservableArray<number[]>;

    public plotData: KnockoutObservableArray;
    private _mouseSubscription = null;
    public isHrGraphEnabled: KnockoutObservable<boolean>;
    public graphHrRange: KnockoutObservableArray<boolean>;
    //public heartRateData: KnockoutObservableArray<number[]>;
    
    constructor(params) {
        console.log("VetMonitorViewController() constructor");
        console.log(params);
        if (params === undefined) return;
        this.mouse = params.mouse;  // KnockoutObservable
        this.mouseCageHasMouse = params.hasMouse;  // KnockoutObservable
        console.log(this.mouseCageHasMouse());
        this.isBloodSugarGraphEnabled = ko.observable(true);
        this.graphRange = _.range(this.graphRangeStart, this.graphRangeEnd);
        this.graphBloodRange =
            ko.observableArray(_.map(this.graphRange, (v) => { return false; }));
        this.plotData = ko.observableArray(null);

        this.simulationInterval = ko.observable(null);

        this.vetMonitor = new VetMonitorModel();
        
        this.isHrGraphEnabled = ko.observable(true);
        this.graphHrRange =
            ko.observableArray(_.map(this.graphRange, (v) => { return false; }));
        
        ko.rebind(this);
    }
    
    isHrGraphEnabledToggle() {
        this.isHrGraphEnabled(!this.isHrGraphEnabled());
    }
    
    isBloodSugarGraphEnabledToggle() {
        this.isBloodSugarGraphEnabled(!this.isBloodSugarGraphEnabled());
    }
    
    getBloodGlucoseDataForPlot():PlotDataPointType[] {
        var bloodData = _.map(this.graphRange, (i): PlotDataPointType => {
            var sugar = null;
            if (!this.mouse().alive()) {
                sugar = 0;
            } else if (this.graphBloodRange()[i]) {
                sugar = this.mouse().bloodData()[i];
            }
            return [i, sugar];
        });
        return bloodData;
    }

    exportData() {
        //this.plotData(); // TODO get it from collector or model?
        var raw = {bloodData: [], heartRateData:[]};
        var headers = ['time', 'blood sugar', 'heart rate'];
        var parsed = _(raw.bloodData)
            .zip(raw.heartRateData)
            .map((row) => {
                var bloodsugar = row[0][1];
                var hr;
                if (row[1][1]) {
                    hr = _.sample(heartRateJsonData.pulse);
                } else {
                    hr = row[1][1]; // either null or 0
                }
                var line = [row[0][0], bloodsugar, hr];
                return line;
            })
            .value();

        popupController.dataExport(DataHelper.toCSV(parsed, headers));
    }
    
    /**
     * Generates pulse data for plot graph.
     * If mouse is dead it's HR is 0.
     * if HR graph is disabled HR is null.
     */
    getHrDataForPlot():PlotDataPointType[] {
        var hrData = [];
        hrData = _.map(this.graphRange, (i): PlotDataPointType => {
            var hr = null;

            var dataIndex = this.mouse().heartRateIndex + i;
            dataIndex = dataIndex % this.mouse().heartRateData.length;
            if (!this.mouse().alive()) {
                hr = 0;
            } else if (this.graphHrRange()[i]) {
                hr = this.mouse().heartRateData[dataIndex];
            }
            return [i, hr];
        });
        return hrData;
    }
    
    updateGraphRanges() {
        this.graphBloodRange.shift();
        if (this.isBloodSugarGraphEnabled()) {
            this.graphBloodRange.push(true);
        } else {
            this.graphBloodRange.push(false);
        }
        this.graphHrRange.shift();
        if (this.isHrGraphEnabled()) {
            this.graphHrRange.push(true);
        } else {
            this.graphHrRange.push(false);
        }
    }

    updatePlotData() {
        this.updateGraphRanges();
        var toPlot =  [
            <PlotItemType>{
                data: this.getHrDataForPlot(),
                yaxis: 2,
                color: 'rgb(255,160,160)'},
            <PlotItemType>{
                data: this.getBloodGlucoseDataForPlot(),
                label: 'mmol/L',
                yaxis: 1,
                color: 'yellow'},
        ];
        this.plotData.removeAll();
        this.plotData(toPlot);
    }
    
    nextTimeStep() {
        if (this.mouseCageHasMouse())
            this.updatePlotData();
    }
    
    toggleSimulation(enabled: boolean) {
        if ((enabled) && (this.simulationInterval() === null)) {
            this.simulationInterval(setInterval(this.nextTimeStep,
                                                this.simulationIntervalTime));
        } else if (this.simulationInterval()) {
            clearInterval(this.simulationInterval());
            this.simulationInterval(null);
        }
    }

    enter(){
        console.log('VetMonitorViewController enter');
        if (this.mouseCageHasMouse())
            this.toggleSimulation(this.mouseCageHasMouse());
        this._mouseSubscription = this.mouse.subscribe((newmouse) => {
            this.toggleSimulation(<boolean>newmouse);
        });
    }

    dispose() {
        console.log("VetMonitorViewController dispose");
        this.toggleSimulation(false);
        this.plotData.removeAll();
        this.plotData([]);
        if (this._mouseSubscription)
            this._mouseSubscription.dispose();
    }
}

export = VetMonitorViewController;