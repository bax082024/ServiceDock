import { useParams } from 'react-router-dom';

function ServiceDetailsPage() {
    const { id } = useParams();

    return (
        <div>
            <p className="eyebrow">SERVICE DETAILS</p>
            <h2>Service #{id}</h2>

            <p className="subtitle">
                Detailed monitoring information.
            </p>
        </div>
    );
}

export default ServiceDetailsPage;