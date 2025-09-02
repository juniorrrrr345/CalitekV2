#!/bin/bash

echo "🔧 Correction des IDs de base D1..."

# Corriger tous les fichiers TypeScript dans src/
find src/ -name "*.ts" -o -name "*.tsx" | while read file; do
    if grep -q "19ee81cc-91c0-4cfc-8cbe-dc67d8675e37" "$file" 2>/dev/null; then
        echo "Correction: $file"
        sed -i 's/19ee81cc-91c0-4cfc-8cbe-dc67d8675e37/e5ef7989-a88e-422c-9f6b-91d2d3adda12/g' "$file"
    fi
done

echo "✅ Correction terminée"
echo "🔍 Vérification..."

# Compter les occurrences restantes
OLD_COUNT=$(find src/ -name "*.ts" -o -name "*.tsx" | xargs grep -l "19ee81cc-91c0-4cfc-8cbe-dc67d8675e37" 2>/dev/null | wc -l)
NEW_COUNT=$(find src/ -name "*.ts" -o -name "*.tsx" | xargs grep -l "e5ef7989-a88e-422c-9f6b-91d2d3adda12" 2>/dev/null | wc -l)

echo "📊 Ancienne base (19ee81cc...): $OLD_COUNT fichiers"
echo "📊 Nouvelle base (e5ef7989...): $NEW_COUNT fichiers"