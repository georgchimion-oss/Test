# Example Usage - Staff List Page

This example shows you how to create a page that displays your Staff data from Dataverse, following the exact pattern from the working GeorgCodeTemplate.

## Prerequisites

You must have already run:
```bash
pac code add-data-source -a dataverse -t crda8_staff4
```

This generates the hooks you'll use below.

---

## Example 1: Simple Staff List

Create `src/pages/staff.tsx`:

```typescript
import { useStaffList } from '@/generated/hooks/useStaff';

export default function StaffPage() {
  const { data: staff, isLoading, error } = useStaffList({
    orderBy: ['crda8_name asc'],
    filter: 'crda8_active eq true'
  });

  if (isLoading) {
    return <div className="p-8">Loading staff...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Staff</h1>

      <div className="grid gap-4">
        {staff?.map(person => (
          <div key={person.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-lg">{person.crda8_name}</h3>
            <p className="text-gray-600">{person.crda8_email}</p>
            <p className="text-sm text-gray-500">{person.crda8_role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Example 2: Staff with Create Form

```typescript
import { useStaffList, useCreateStaff } from '@/generated/hooks/useStaff';
import { useState } from 'react';

export default function StaffPage() {
  const { data: staff, isLoading } = useStaffList({
    orderBy: ['crda8_name asc']
  });

  const createMutation = useCreateStaff();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createMutation.mutateAsync({
      crda8_name: name,
      crda8_email: email,
      crda8_role: role,
      crda8_active: true,
    });

    // Clear form
    setName('');
    setEmail('');
    setRole('');
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Staff</h1>

      {/* Create Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Staff</h2>

        <div className="grid gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
            className="border rounded px-3 py-2"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="border rounded px-3 py-2"
          />

          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Role"
            className="border rounded px-3 py-2"
          />

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Creating...' : 'Add Staff'}
          </button>
        </div>
      </form>

      {/* List */}
      <div className="grid gap-4">
        {staff?.map(person => (
          <div key={person.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-lg">{person.crda8_name}</h3>
            <p className="text-gray-600">{person.crda8_email}</p>
            <p className="text-sm text-gray-500">{person.crda8_role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Example 3: Staff with Update and Delete

```typescript
import {
  useStaffList,
  useUpdateStaff,
  useDeleteStaff
} from '@/generated/hooks/useStaff';

export default function StaffPage() {
  const { data: staff } = useStaffList({
    orderBy: ['crda8_name asc']
  });

  const updateMutation = useUpdateStaff();
  const deleteMutation = useDeleteStaff();

  const toggleActive = async (person: any) => {
    await updateMutation.mutateAsync({
      id: person.id,
      changedFields: {
        crda8_active: !person.crda8_active
      }
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Staff</h1>

      <div className="grid gap-4">
        {staff?.map(person => (
          <div key={person.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">{person.crda8_name}</h3>
              <p className="text-gray-600">{person.crda8_email}</p>
              <span className={`text-xs px-2 py-1 rounded ${
                person.crda8_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {person.crda8_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleActive(person)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Toggle Active
              </button>

              <button
                onClick={() => handleDelete(person.id, person.crda8_name)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Example 4: Deliverables with Filtering

```typescript
import { useDeliverablesList } from '@/generated/hooks/useDeliverables';
import { useState } from 'react';

export default function DeliverablesPage() {
  const [statusFilter, setStatusFilter] = useState<number | null>(null);

  const { data: deliverables, isLoading } = useDeliverablesList({
    filter: statusFilter !== null ? `crda8_status eq ${statusFilter}` : undefined,
    orderBy: ['crda8_targetdate asc']
  });

  const statusLabels = {
    0: 'Not Started',
    1: 'In Progress',
    2: 'In Review',
    3: 'Completed'
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Deliverables</h1>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setStatusFilter(null)}
          className={`px-4 py-2 rounded ${
            statusFilter === null ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          All
        </button>

        {[0, 1, 2, 3].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded ${
              statusFilter === status ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {statusLabels[status as keyof typeof statusLabels]}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="grid gap-4">
        {deliverables?.map(d => (
          <div key={d.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-lg">{d.crda8_name}</h3>
            <p className="text-gray-600">{d.crda8_description}</p>
            <div className="mt-2 flex gap-4 text-sm">
              <span>Status: {statusLabels[d.crda8_status as keyof typeof statusLabels]}</span>
              <span>Target: {new Date(d.crda8_targetdate).toLocaleDateString()}</span>
              <span>Progress: {d.crda8_completionpercentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Adding Routes

Update `src/app.tsx` to include your new pages:

```typescript
import StaffPage from './pages/staff';
import DeliverablesPage from './pages/deliverables';

// Inside <Routes>:
<Route path="/staff" element={<StaffPage />} />
<Route path="/deliverables" element={<DeliverablesPage />} />
```

---

## Field Name Reference

Your Dataverse tables use these field naming patterns:

### Staff (crda8_staff4)
- `crda8_name` - Name
- `crda8_email` - Email
- `crda8_role` - Role
- `crda8_department` - Department
- `crda8_active` - Active (boolean)

### Deliverables (crda8_deliverables)
- `crda8_name` - Name
- `crda8_description` - Description
- `crda8_status` - Status (0=Not Started, 1=In Progress, 2=In Review, 3=Completed)
- `crda8_targetdate` - Target Date
- `crda8_completionpercentage` - Completion %
- `crda8_owner` - Owner
- `crda8_workstream` - Workstream
- `crda8_risk` - Risk Level
- `crda8_active` - Active

### Workstreams (crda8_workstreams)
- `crda8_name` - Name
- `crda8_description` - Description
- `crda8_lead` - Lead
- `crda8_active` - Active

---

## Tips

1. **Always handle loading states** - Users need to see something while data loads
2. **Always handle errors** - Network issues happen
3. **Use orderBy** - Sort your data for better UX
4. **Use filter** - Don't load inactive records unless needed
5. **Disable buttons during mutations** - Prevent double-submissions

---

## Next Steps

1. Copy one of these examples to create your first page
2. Add it to the router in `src/app.tsx`
3. Test with `pac code run`
4. Build and deploy with `npm run build && pac code push`
