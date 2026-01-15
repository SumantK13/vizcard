import { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ocrData, setOcrData] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    emails: [''],
    phones: ['']
  });

  /* ---------------- FILE HANDLING ---------------- */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (preview) URL.revokeObjectURL(preview);
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setOcrData(null);
  };

  /* ---------------- OCR SCAN ---------------- */
  const handleScan = async () => {
    if (!file) return alert('Please select a file first!');
    setIsLoading(true);

    const data = new FormData();
    data.append('cardImage', file);

    try {
      const res = await axios.post(
        'http://localhost:3000/api/card/scan',
        data
      );

      const { emails, phones, names, companies } = res.data.data;

      setOcrData(res.data.data);

      setFormData({
        name: names.values[0] || '',
        company: companies.values[0] || '',
        emails: emails.values.length ? emails.values : [''],
        phones: phones.values.length ? phones.values : ['']
      });
    } catch (err) {
      console.error(err);
      alert('Scanning failed.');
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- FORM HELPERS ---------------- */
  const handleArrayChange = (index, value, field) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const addField = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeField = (index, field) => {
    const updated = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: updated.length ? updated : [''] });
  };

  const addSuggestion = (field, value) => {
    const list = formData[field];
    if (list[list.length - 1] === '') {
      handleArrayChange(list.length - 1, value, field);
    } else {
      setFormData({ ...formData, [field]: [...list, value] });
    }
  };

  /* ---------------- SAVE ---------------- */
  const handleSave = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      company: formData.company,
      emails: formData.emails.filter((e) => e.trim()),
      phones: formData.phones.filter((p) => p.trim())
    };

    try {
      await axios.post(
        'http://localhost:3000/api/card/save',
        payload
      );
      alert('✅ Contact Saved Successfully!');
    } catch {
      alert('Failed to save.');
    }
  };

  const getConfColor = (score) => {
    if (score >= 90) return '#22c55e';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            📇 VizCard <span className="text-indigo-600">AI</span>
          </h1>
          <p className="text-sm text-gray-500">
            Smart Business Card Digitizer
          </p>
        </div>

        <button
          onClick={() =>
            window.open('http://localhost:3000/api/card/export')
          }
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
        >
          📥 Export CSV
        </button>
      </header>

      {/* UPLOAD */}
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow mb-8 flex gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-600
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-lg file:border-0
                     file:bg-indigo-50 file:text-indigo-700
                     hover:file:bg-indigo-100"
        />

        <button
          onClick={handleScan}
          disabled={!file || isLoading}
          className={`px-6 py-2 rounded-lg text-white font-medium
            ${
              isLoading || !file
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
        >
          {isLoading ? 'Scanning...' : 'Scan Card'}
        </button>
      </div>

      {/* MAIN GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Edit Details</h2>

          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-56 object-contain border rounded-lg mb-6"
            />
          )}

          <form onSubmit={handleSave} className="space-y-4">
            {/* NAME */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium">
                Name
                {ocrData && (
                  <span
                    className="px-2 py-0.5 text-xs text-white rounded-full"
                    style={{
                      background: getConfColor(
                        ocrData.names.confidence
                      )
                    }}
                  >
                    {ocrData.names.confidence}%
                  </span>
                )}
              </label>
              <input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* COMPANY */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium">
                Company
                {ocrData && (
                  <span
                    className="px-2 py-0.5 text-xs text-white rounded-full"
                    style={{
                      background: getConfColor(
                        ocrData.companies.confidence
                      )
                    }}
                  >
                    {ocrData.companies.confidence}%
                  </span>
                )}
              </label>
              <input
                value={formData.company}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    company: e.target.value
                  })
                }
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* EMAILS */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Emails</span>
                <button
                  type="button"
                  onClick={() => addField('emails')}
                  className="text-indigo-600 text-sm"
                >
                  + Add
                </button>
              </div>

              {formData.emails.map((email, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    value={email}
                    onChange={(e) =>
                      handleArrayChange(
                        i,
                        e.target.value,
                        'emails'
                      )
                    }
                    className="flex-1 border rounded-lg px-3 py-2"
                  />
                  {formData.emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField(i, 'emails')}
                      className="px-3 bg-red-100 text-red-600 rounded-lg"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* PHONES */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="flex items-center gap-2 text-sm font-medium">
  Phones
  {ocrData && (
    <span
      className="px-2 py-0.5 text-xs text-white rounded-full"
      style={{
        background: getConfColor(ocrData.phones.confidence)
      }}
    >
      {ocrData.phones.confidence}%
    </span>
  )}
</label>
                <button
                  type="button"
                  onClick={() => addField('phones')}
                  className="text-indigo-600 text-sm"
                >
                  + Add
                </button>
              </div>

              {formData.phones.map((phone, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    value={phone}
                    onChange={(e) =>
                      handleArrayChange(
                        i,
                        e.target.value,
                        'phones'
                      )
                    }
                    className="flex-1 border rounded-lg px-3 py-2"
                  />
                  {formData.phones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField(i, 'phones')}
                      className="px-3 bg-red-100 text-red-600 rounded-lg"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Save Contact
            </button>
          </form>
        </div>

        {/* RIGHT */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            AI Suggestions
          </h2>

          {!ocrData && (
            <p className="text-gray-400 text-sm">
              No scan data yet.
            </p>
          )}

          {ocrData && (
            <div className="space-y-6 max-h-[520px] overflow-y-auto">
              {/* PHONES */}
              {ocrData.phones.values.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">
                    📞 Phones
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ocrData.phones.values.map((v, i) => (
                      <button
                        key={i}
                        onClick={() =>
                          addSuggestion('phones', v)
                        }
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full"
                      >
                        + {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* EMAILS */}
              {ocrData.emails.values.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">
                    📧 Emails
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ocrData.emails.values.map((v, i) => (
                      <button
                        key={i}
                        onClick={() =>
                          addSuggestion('emails', v)
                        }
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full"
                      >
                        + {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* RAW TEXT */}
              <div>
                <h3 className="font-medium mb-2">
                  📝 Raw Text
                </h3>
                {ocrData.names.values.map((t, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center border p-2 rounded-lg mb-2 bg-gray-50"
                  >
                    <span className="text-sm truncate">
                      {t}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            name: t
                          })
                        }
                        className="px-2 py-1 text-xs bg-indigo-600 text-white rounded"
                      >
                        Name
                      </button>
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            company: t
                          })
                        }
                        className="px-2 py-1 text-xs bg-gray-700 text-white rounded"
                      >
                        Org
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;