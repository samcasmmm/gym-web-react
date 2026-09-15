import React, { useState, useEffect } from 'react';
import { db, initializeDatabase } from '../db/database';
import { useWorkout } from '../context/WorkoutContext';
import { Settings as SettingsIcon, Download, Upload, Trash2, RefreshCw, CheckCircle, Database } from 'lucide-react';

const Settings: React.FC = () => {
  const { unit, setUnit } = useWorkout();
  const [userName, setUserName] = useState('Athlete');
  const [defaultRest, setDefaultRest] = useState(90);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    db.settings.get('app_settings').then((settings) => {
      if (settings) {
        if (settings.userName) setUserName(settings.userName);
        if (settings.defaultRestTime) setDefaultRest(settings.defaultRestTime);
      }
    });
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.settings.update('app_settings', {
      userName,
      defaultRestTime: Number(defaultRest),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportData = async () => {
    const workouts = await db.workouts.toArray();
    const workoutSets = await db.workoutSets.toArray();
    const bodyMeasurements = await db.bodyMeasurements.toArray();
    const personalRecords = await db.personalRecords.toArray();
    const routines = await db.routines.toArray();
    const settings = await db.settings.toArray();

    const backup = {
      version: 1,
      exportDate: new Date().toISOString(),
      workouts,
      workoutSets,
      bodyMeasurements,
      personalRecords,
      routines,
      settings,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `irontrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.workouts) await db.workouts.bulkPut(data.workouts);
        if (data.workoutSets) await db.workoutSets.bulkPut(data.workoutSets);
        if (data.bodyMeasurements) await db.bodyMeasurements.bulkPut(data.bodyMeasurements);
        if (data.personalRecords) await db.personalRecords.bulkPut(data.personalRecords);
        if (data.routines) await db.routines.bulkPut(data.routines);
        alert('Data backup successfully imported!');
        window.location.reload();
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = async () => {
    if (confirm('Are you sure you want to reset all workout history and data?')) {
      await db.workouts.clear();
      await db.workoutSets.clear();
      await db.bodyMeasurements.clear();
      await db.personalRecords.clear();
      alert('All workout data has been cleared.');
      window.location.reload();
    }
  };

  const handleReloadDemoData = async () => {
    if (confirm('Reload sample workouts and progression data?')) {
      await db.workouts.clear();
      await db.workoutSets.clear();
      await db.bodyMeasurements.clear();
      await db.personalRecords.clear();
      await initializeDatabase();
      alert('Sample workout history reloaded!');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF2625] flex items-center gap-1.5">
            <SettingsIcon className="w-4 h-4" /> Preferences
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mt-1">App Settings</h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure units, rest timer defaults, and manage offline data backup.
          </p>
        </div>
      </div>

      {/* Profile & Preferences Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-gray-900">General Preferences</h2>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Weight Unit
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setUnit('kg')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  unit === 'kg'
                    ? 'bg-[#FF2625] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Kilograms (kg)
              </button>
              <button
                type="button"
                onClick={() => setUnit('lbs')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  unit === 'lbs'
                    ? 'bg-[#FF2625] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pounds (lbs)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Athlete Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF2625]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Default Rest Timer (seconds)
            </label>
            <input
              type="number"
              min="15"
              step="15"
              value={defaultRest}
              onChange={(e) => setDefaultRest(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF2625]"
            />
          </div>

          <button
            type="submit"
            className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Saved!
              </>
            ) : (
              'Save Preferences'
            )}
          </button>
        </form>
      </div>

      {/* Data Backup & Restore */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-[#FF2625]" />
            IndexedDB Data Management
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            All your workouts and progression are stored locally in your browser's IndexedDB. Export JSON backups to keep your data safe.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleExportData}
            className="p-5 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center gap-4 text-left transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Export Data to JSON</h4>
              <p className="text-xs text-gray-500">Download complete workout backup</p>
            </div>
          </button>

          <label className="p-5 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center gap-4 text-left transition-colors cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Import JSON Backup</h4>
              <p className="text-xs text-gray-500">Restore workouts and measurements</p>
            </div>
            <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
          </label>
        </div>

        <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={handleReloadDemoData}
            className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload Sample Data
          </button>
          <button
            type="button"
            onClick={handleResetData}
            className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
