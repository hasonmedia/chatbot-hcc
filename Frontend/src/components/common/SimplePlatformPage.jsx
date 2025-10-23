import PlatformContent from "../common/PlatformContent";

const SimplePlatformPage = ({ 
    data, 
    loading, 
    showForm, 
    editing,
    onEdit, 
    onDelete, 
    onSubmit, 
    onCancel,
    StatsComponent, 
    TableComponent, 
    FormComponent,
    onAddNew = null 
}) => {
    return (
        <div className="space-y-6">
            {/* Optional Add Button */}
            {onAddNew && (
                <div className="flex justify-end">
                    <button
                        onClick={onAddNew}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <span className="text-sm">+</span>
                        Thêm mới
                    </button>
                </div>
            )}

            <PlatformContent
                loading={loading}
                stats={<StatsComponent data={data} />}
                table={
                    <TableComponent
                        data={data}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                }
                form={
                    <FormComponent
                        initialData={editing}
                        onSubmit={onSubmit}
                        onCancel={onCancel}
                    />
                }
                showForm={showForm}
            />
        </div>
    );
};

export default SimplePlatformPage;