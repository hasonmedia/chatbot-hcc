import LoadingCard from './LoadingCard';

const PlatformContent = ({ 
    loading, 
    stats, 
    table, 
    form, 
    showForm, 
    onEdit, 
    onDelete 
}) => {
    return (
        <div className="space-y-6">
            {/* Stats */}
            {stats}

            {/* Content */}
            {loading ? (
                <LoadingCard />
            ) : (
                table
            )}

            {/* Form */}
            {showForm && form}
        </div>
    );
};

export default PlatformContent;