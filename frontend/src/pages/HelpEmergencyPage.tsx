import React, { useState, useEffect } from 'react';
import { useCity } from '../context/CityContext';
import { publicApi } from '../api/publicApi';
import { HelpContact, Grievance, GrievanceCategory } from '../types';
import { HelpCard } from '../components/cards/HelpCard';
import { SearchBar } from '../components/common/SearchBar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';

const GRIEVANCE_CATEGORIES: GrievanceCategory[] = [
  'Bus Delay',
  'Vehicle Condition',
  'Charging Station Issue',
  'Driver Conduct',
  'Other',
];

export const HelpEmergencyPage: React.FC = () => {
  const { selectedCity, selectedState, openCityModal } = useCity();

  const [contacts, setContacts] = useState<HelpContact[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  // Grievance form state
  const [grievanceCategory, setGrievanceCategory] = useState<string>(GRIEVANCE_CATEGORIES[0]);
  const [grievanceDescription, setGrievanceDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedGrievance, setSubmittedGrievance] = useState<Grievance | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const data = await publicApi.getHelpContacts({ city: selectedCity });
        setContacts(data);
      } catch (err) {
        console.error('Failed to load help contacts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [selectedCity]);

  const filteredContacts = contacts.filter((c) => {
    const matchesCategory =
      selectedCategory === 'all' ? true : c.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = searchQuery
      ? c.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.phone || '').includes(searchQuery)
      : true;
    return matchesCategory && matchesSearch;
  });

  const handleGrievanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievanceDescription.trim()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await publicApi.submitGrievance({
        category: grievanceCategory,
        description: grievanceDescription.trim(),
        city: selectedCity,
        reporter_name: reporterName.trim() || undefined,
        reporter_phone: reporterPhone.trim() || undefined,
        reporter_email: reporterEmail.trim() || undefined,
      });
      setSubmittedGrievance(result);
      setGrievanceDescription('');
      setReporterName('');
      setReporterPhone('');
      setReporterEmail('');
      setGrievanceCategory(GRIEVANCE_CATEGORIES[0]);
    } catch (err: any) {
      console.error('Failed to submit grievance:', err);
      setSubmitError(
        err.response?.data?.detail || 'Failed to submit your grievance. Please try again or use a helpline above.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full py-10 bg-surface">
      <div className="max-w-container-max-width mx-auto px-gutter">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 pb-6 border-b border-outline-variant/60 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container text-error text-xs font-label-bold mb-2">
              <span className="material-symbols-outlined text-sm">emergency</span>
              24/7 Citizen Emergency & Grievance Hub
            </div>
            <h1 className="font-display-lg text-3xl sm:text-4xl font-bold text-on-background">
              Help & Emergency Contacts
            </h1>
            <p className="font-body-md text-sm sm:text-base text-on-surface-variant mt-1">
              Direct emergency helplines for electric bus transit, EV roadside recovery, hospital trauma dispatch, and passenger grievance for {selectedCity}, {selectedState}.
            </p>
          </div>

          <button
            onClick={openCityModal}
            className="flex items-center gap-1.5 bg-white border border-outline-variant px-4 py-2 rounded-lg text-xs font-label-bold text-on-surface hover:bg-surface-container transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-primary text-base">location_on</span>
            <span>City: {selectedCity}</span>
            <span className="text-primary hover:underline ml-1">Change</span>
          </button>
        </div>

        {/* Top Emergency Action Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="p-6 rounded-2xl bg-red-600 text-white shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-label-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded">
                  National Emergency
                </span>
                <span className="material-symbols-outlined text-2xl">local_police</span>
              </div>
              <h3 className="font-display-lg text-2xl font-bold">Police & Rapid Transit 112</h3>
              <p className="text-xs text-white/90 mt-1 leading-relaxed">
                Single unified emergency number for police assistance, traffic clearance, and immediate on-road incidents.
              </p>
            </div>
            <a
              href="tel:112"
              className="mt-5 inline-flex items-center justify-center gap-2 bg-white text-red-700 py-3 rounded-lg text-sm font-label-bold hover:bg-gray-100 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">call</span>
              Dial 112
            </a>
          </div>

          <div className="p-6 rounded-2xl bg-secondary text-white shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-label-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded">
                  24/7 EV Breakdown
                </span>
                <span className="material-symbols-outlined text-2xl">car_repair</span>
              </div>
              <h3 className="font-display-lg text-2xl font-bold">Rajasthan EV Roadside</h3>
              <p className="text-xs text-white/90 mt-1 leading-relaxed">
                Toll-free battery flatbed towing, mobile EV charging support, and charging hub outage complaints.
              </p>
            </div>
            <a
              href="tel:18001806127"
              className="mt-5 inline-flex items-center justify-center gap-2 bg-white text-secondary py-3 rounded-lg text-sm font-label-bold hover:bg-gray-100 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">call</span>
              1800 180 6127 (Toll Free)
            </a>
          </div>

          <div className="p-6 rounded-2xl bg-primary text-white shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-label-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded">
                  Municipal E-Bus Desk
                </span>
                <span className="material-symbols-outlined text-2xl">directions_bus</span>
              </div>
              <h3 className="font-display-lg text-2xl font-bold">Bikaner Transit Control</h3>
              <p className="text-xs text-white/90 mt-1 leading-relaxed">
                Live bus route enquiry, lost items on e-buses, passenger concessions, and timetable information.
              </p>
            </div>
            <a
              href="tel:+911512226600"
              className="mt-5 inline-flex items-center justify-center gap-2 bg-white text-primary py-3 rounded-lg text-sm font-label-bold hover:bg-gray-100 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">call</span>
              +91 151 222 6600
            </a>
          </div>
        </div>

        {/* Directory Search & Filter */}
        <div className="bg-white rounded-xl border border-outline-variant p-4 mb-8 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="w-full sm:max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search helplines by department or service..."
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {['all', 'transport', 'charging_support', 'emergency'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-label-bold capitalize transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                {cat === 'all' ? 'All Helplines' : cat.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts Grid */}
        <div className="mb-14">
          {loading ? (
            <LoadingSpinner message="Loading verified emergency helplines..." />
          ) : filteredContacts.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-outline-variant text-sm text-on-surface-variant">
              No helpline contacts match your filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredContacts.map((contact) => (
                <HelpCard key={contact.id} contact={contact} />
              ))}
            </div>
          )}
        </div>

        {/* Citizen Grievance Redressal Form */}
        <div className="bg-white rounded-2xl border border-outline-variant p-6 sm:p-10 shadow-sm max-w-3xl mx-auto mb-10">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1 text-xs font-label-bold text-secondary uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-base">rate_review</span>
              Online Redressal Portal
            </div>
            <h2 className="font-display-lg text-2xl font-bold text-on-background">
              Submit Public Grievance or Transit Feedback
            </h2>
            <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1">
              Have an issue with a charging station, bus route, or driver conduct? Submit your complaint directly to the municipal transport authority for {selectedCity}.
            </p>
          </div>

          {submittedGrievance ? (
            <div className="p-8 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <span className="material-symbols-outlined text-emerald-600 text-4xl" data-weight="fill">
                check_circle
              </span>
              <h3 className="font-headline-sm text-lg font-bold text-emerald-900">
                Grievance Submitted Successfully
              </h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Thank you. Your grievance has been recorded with reference{' '}
                <strong>#{submittedGrievance.id.slice(0, 8).toUpperCase()}</strong>. Status:{' '}
                <strong>{submittedGrievance.status}</strong>. The nodal officer will review and update accordingly.
              </p>
              <Button variant="outline" size="sm" onClick={() => setSubmittedGrievance(null)}>
                Submit Another Grievance
              </Button>
            </div>
          ) : (
            <form onSubmit={handleGrievanceSubmit} className="space-y-4">
              {submitError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base shrink-0">error</span>
                  <span>{submitError}</span>
                </div>
              )}

              <Select
                label="Grievance Category *"
                value={grievanceCategory}
                onChange={(e) => setGrievanceCategory(e.target.value)}
                required
              >
                {GRIEVANCE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>

              <div className="space-y-1.5 text-left">
                <label className="block text-label-sm text-on-surface font-semibold">
                  Detailed Description *
                </label>
                <textarea
                  rows={4}
                  value={grievanceDescription}
                  onChange={(e) => setGrievanceDescription(e.target.value)}
                  placeholder="Describe what occurred, station/vehicle number, date and time..."
                  className="w-full bg-white border border-outline-variant text-on-surface text-sm rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Full Name (optional)"
                  placeholder="Enter your name"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                />
                <Input
                  label="Mobile Number (optional)"
                  placeholder="+91 98765 43210"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                />
                <Input
                  label="Email (optional)"
                  type="email"
                  placeholder="you@example.com"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                />
              </div>

              <p className="text-[11px] text-on-surface-variant">
                You may leave your contact details blank to submit anonymously.
              </p>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" icon="send" loading={submitting}>
                  Submit Official Grievance
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Quick Dial Directory (reference contacts) */}
        <div className="bg-white rounded-2xl border border-outline-variant p-6 sm:p-10 shadow-sm max-w-3xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-6">
            <div className="inline-flex items-center gap-1 text-xs font-label-bold text-secondary uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-base">call</span>
              Prefer to Call Directly?
            </div>
            <h2 className="font-display-lg text-xl font-bold text-on-background">
              Direct Helpline Contacts
            </h2>
            <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1">
              Urgent issues are handled faster over the phone. These are pulled directly from verified
              municipal records for {selectedCity}.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredContacts.slice(0, 4).map((contact) => (
              contact.phone ? (
                <a
                  key={contact.id}
                  href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-outline-variant hover:border-primary hover:bg-primary-container/5 transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <div className="text-sm font-semibold text-on-background truncate">
                      {contact.department}
                    </div>
                    <div className="text-xs text-on-surface-variant">{contact.phone}</div>
                  </div>
                  <span className="material-symbols-outlined text-primary shrink-0">call</span>
                </a>
              ) : null
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
