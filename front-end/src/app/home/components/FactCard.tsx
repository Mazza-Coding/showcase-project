import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fact } from "../types";

interface FactCardProps {
  fact: Fact;
}

const FactCard: React.FC<FactCardProps> = ({ fact }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{fact.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{fact.body}</p>
        <Badge variant="secondary">{fact.tag}</Badge>
      </CardContent>
    </Card>
  );
};

export default FactCard;
